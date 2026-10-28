package cmd

import (
	"fmt"
	"os"

	"github.com/AlecAivazis/survey/v2"
	"github.com/fatih/color"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/core"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/detect"
	"github.com/spf13/cobra"
)

var removeCmd = &cobra.Command{
	Use:   "remove [id]",
	Short: "Remove MCP from a client",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		cyan := color.New(color.FgCyan)
		green := color.New(color.FgGreen)
		red := color.New(color.FgRed)
		yellow := color.New(color.FgYellow)
		gray := color.New(color.FgHiBlack)

		m, err := core.LoadMapping()
		if err != nil {
			fmt.Println(red.Sprint("Error:"), err)
			return
		}
		det, err := detect.Run()
		if err != nil {
			fmt.Println(red.Sprint("Error:"), err)
			return
		}

		clientID := ""
		to, _ := cmd.Flags().GetString("to")
		if to != "" {
			clientID = to
		} else {
			var choices []string
			for _, cl := range det.Clients {
				choices = append(choices, fmt.Sprintf("%s [%s]", cl.Name, cl.ID))
			}
			var ans string
			prompt := &survey.Select{Message: "Pilih client", Options: choices}
			if err := survey.AskOne(prompt, &ans); err != nil {
				fmt.Println(red.Sprint("Error:"), err)
				return
			}
			for _, cl := range det.Clients {
				s := fmt.Sprintf("%s [%s]", cl.Name, cl.ID)
				if s == ans {
					clientID = cl.ID
					break
				}
			}
		}

		cwd, _ := os.Getwd()
		list, err := core.ListMcp(m, clientID, cwd)
		if err != nil {
			fmt.Println(red.Sprint("Error:"), err)
			return
		}
		servers, _ := list["servers"].(map[string]interface{})
		if len(servers) == 0 {
			fmt.Println(yellow.Sprint("Tidak ada MCP terdaftar di client ini"))
			return
		}
		mcpID := ""
		if len(args) > 0 {
			mcpID = args[0]
		}
		if mcpID == "" {
			var choices []string
			for k := range servers {
				choices = append(choices, k)
			}
			var ans string
			prompt := &survey.Select{Message: "Pilih MCP yang mau dihapus", Options: choices}
			if err := survey.AskOne(prompt, &ans); err != nil {
				fmt.Println(red.Sprint("Error:"), err)
				return
			}
			mcpID = ans
		}

		dry, _ := cmd.Flags().GetBool("dry-run")
		res, err := core.RemoveMcp(m, clientID, mcpID, dry, cwd)
		if err != nil {
			fmt.Println(red.Sprint("Error:"), err)
			return
		}
		if dry {
			fmt.Println(cyan.Sprintf("\nmcpfs remove %s", mcpID))
			if p, ok := res["path"].(string); ok {
				fmt.Printf("  %s [dry-run] %s -> %s\n", gray.Sprint("~"), clientID, p)
			}
		} else {
			fmt.Println(cyan.Sprintf("\nmcpfs remove %s", mcpID))
			if p, ok := res["path"].(string); ok {
				fmt.Printf("  %s removed from %s -> %s\n", green.Sprint("✓"), clientID, p)
			}
		}
	},
}

func init() {
	removeCmd.Flags().StringP("to", "t", "", "Target client")
	removeCmd.Flags().Bool("dry-run", false, "Show changes without writing")
	rootCmd.AddCommand(removeCmd)
}
