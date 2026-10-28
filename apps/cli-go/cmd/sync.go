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

var syncCmd = &cobra.Command{
	Use:   "sync [id]",
	Short: "Sync MCP to multiple detected clients",
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
			prompt := &survey.Select{Message: "Sync MCP to all detected clients", Options: choices}
			if err := survey.AskOne(prompt, &ans); err != nil {
				fmt.Println(red.Sprint("Error:"), err)
				return
			}
			if list, ok := reg["mcp"].([]interface{}); ok {
				for _, it := range list {
					if mm, ok := it.(map[string]interface{}); ok {
						idv := fmt.Sprintf("%v", mm["id"])
						namev := fmt.Sprintf("%v", mm["name"])
						desc := fmt.Sprintf("%v", mm["description"])
						s := fmt.Sprintf("%s (%s) - %s", namev, idv, desc)
						if s == ans {
							mcpID = idv
							break
						}
					}
				}
			}
		}

		found := det.Clients
		var targets []detect.ClientResult
		for _, cl := range found {
			if cl.Found {
				targets = append(targets, cl)
			}
		}
		if len(targets) == 0 {
			fmt.Println(color.YellowString("Ga ada client yang terdeteksi"))
			return
		}
		sort.Slice(targets, func(i, j int) bool {
			if targets[i].Priority != targets[j].Priority {
				return targets[i].Priority < targets[j].Priority
			}
			return targets[i].Name < targets[j].Name
		})

		dry, _ := cmd.Flags().GetBool("dry-run")
		cwd, _ := os.Getwd()
		fmt.Println(cyan.Sprintf("\nmcpfs sync %s", mcpID))
		for _, c := range targets {
			res, err := core.AddMcp(m, reg, c.ID, mcpID, dry, cwd)
			if err != nil {
				fmt.Printf("  %s %s: %s\n", red.Sprint("✗"), c.Name, err)
				continue
			}
			if dry {
				if p, ok := res["path"].(string); ok {
					fmt.Printf("  %s [dry-run] %s -> %s\n", gray.Sprint("~"), c.Name, p)
				}
			} else {
				if p, ok := res["path"].(string); ok {
					fmt.Printf("  %s %s -> %s\n", green.Sprint("✓"), c.Name, p)
				}
			}
		}
		if !dry {
			fmt.Println(gray.Sprint("\nDone."))
		}
	},
}

func init() {
	syncCmd.Flags().Bool("dry-run", false, "Show changes without writing")
	rootCmd.AddCommand(syncCmd)
}
