package cmd

import (
	"fmt"
	"os"
	"sort"

	"github.com/AlecAivazis/survey/v2"
	"github.com/fatih/color"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/core"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/detect"
	"github.com/spf13/cobra"
)

var addCmd = &cobra.Command{
	Use:   "add [id]",
	Short: "Add MCP from curated registry",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		cyan := color.New(color.FgCyan)
		green := color.New(color.FgGreen)
		red := color.New(color.FgRed)
		gray := color.New(color.FgHiBlack)

		m, err := core.LoadMapping()
		if err != nil {
			fmt.Println(red.Sprint("Error:"), err)
			return
		}
		reg, err := core.LoadRegistry()
		if err != nil {
			fmt.Println(red.Sprint("Error:"), err)
			return
		}
		det, err := detect.Run()
		if err != nil {
			fmt.Println(red.Sprint("Error:"), err)
			return
		}

		mcpID := ""
		if len(args) > 0 {
			mcpID = args[0]
		}
		if mcpID == "" {
			var choices []string
			// build map
			if list, ok := reg["mcp"].([]interface{}); ok {
				for _, it := range list {
					if mm, ok := it.(map[string]interface{}); ok {
						idv := fmt.Sprintf("%v", mm["id"])
						namev := fmt.Sprintf("%v", mm["name"])
						desc := fmt.Sprintf("%v", mm["description"])
						choices = append(choices, fmt.Sprintf("%s (%s) - %s", namev, idv, desc))
					}
				}
			}
			var ans string
			prompt := &survey.Select{Message: "Pilih MCP dari curated registry", Options: choices}
			if err := survey.AskOne(prompt, &ans); err != nil {
				fmt.Println(red.Sprint("Error:"), err)
				return
			}
			// extract id in parens
			// simple
			for _, it := range choices {
				if it == ans {
					// find
					break
				}
			}
			// easier: re-map
			if list, ok := reg["mcp"].([]interface{}); ok {
				idx := -1
				for i, it := range list {
					if mm, ok := it.(map[string]interface{}); ok {
						idv := fmt.Sprintf("%v", mm["id"])
						namev := fmt.Sprintf("%v", mm["name"])
						desc := fmt.Sprintf("%v", mm["description"])
						s := fmt.Sprintf("%s (%s) - %s", namev, idv, desc)
						if s == ans {
							idx = i
							break
						}
					}
				}
				if idx >= 0 {
					if mm, ok := list[idx].(map[string]interface{}); ok {
						mcpID = fmt.Sprintf("%v", mm["id"])
					}
				}
			}
		}

		to, _ := cmd.Flags().GetStringSlice("to")
		var targets []string
		if len(to) == 0 {
			var choices []string
			// sorted
			clients := det.Clients
			sort.Slice(clients, func(i, j int) bool {
				if clients[i].Priority != clients[j].Priority {
					return clients[i].Priority < clients[j].Priority
				}
				return clients[i].Name < clients[j].Name
			})
			for _, cl := range clients {
				if cl.Found {
					choices = append(choices, fmt.Sprintf("%s (detected) [%s]", cl.Name, cl.ID))
				} else {
					choices = append(choices, fmt.Sprintf("%s (not detected) [%s]", cl.Name, cl.ID))
				}
			}
			var ans []string
			prompt := &survey.MultiSelect{Message: "Pilih client tujuan", Options: choices}
			if err := survey.AskOne(prompt, &ans); err != nil {
				fmt.Println(red.Sprint("Error:"), err)
				return
			}
			for _, a := range ans {
				// extract [id]
				for i := len(a) - 1; i >= 0; i-- {
					if a[i] == '[' {
						targets = append(targets, a[i+1:len(a)-1])
						break
					}
				}
			}
		} else {
			targets = to
		}

		if len(targets) == 0 {
			fmt.Println(color.YellowString("Ga ada target yang dipilih"))
			return
		}

		dry, _ := cmd.Flags().GetBool("dry-run")
		cwd, _ := os.Getwd()
		fmt.Println(cyan.Sprintf("\nmcpfs add %s", mcpID))
		for _, t := range targets {
			res, err := core.AddMcp(m, reg, t, mcpID, dry, cwd)
			if err != nil {
				fmt.Printf("  %s %s: %s\n", red.Sprint("✗"), t, err)
				continue
			}
			if dry {
				if p, ok := res["path"].(string); ok {
					fmt.Printf("  %s [dry-run] %s -> %s\n", gray.Sprint("~"), t, p)
				}
			} else {
				if p, ok := res["path"].(string); ok {
					fmt.Printf("  %s %s -> %s\n", green.Sprint("✓"), t, p)
				}
			}
		}
		if !dry {
			fmt.Println(gray.Sprint("\nDone."))
		}
	},
}

func init() {
	addCmd.Flags().StringSliceP("to", "t", []string{}, "Target clients")
	addCmd.Flags().Bool("dry-run", false, "Show changes without writing")
	rootCmd.AddCommand(addCmd)
}
