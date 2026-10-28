package cmd

import (
	"fmt"
	"os"
	"sort"

	"github.com/fatih/color"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/core"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/detect"
	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List MCPs per client",
	Run: func(cmd *cobra.Command, args []string) {
		cyan := color.New(color.FgCyan)
		bold := color.New(color.Bold)
		gray := color.New(color.FgHiBlack)
		green := color.New(color.FgGreen)
		red := color.New(color.FgRed)

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
		cwd, _ := os.Getwd()
		fmt.Println(cyan.Sprint("mcpfs list"))
		clients := det.Clients
		sort.Slice(clients, func(i, j int) bool {
			if clients[i].Priority != clients[j].Priority {
				return clients[i].Priority < clients[j].Priority
			}
			return clients[i].Name < clients[j].Name
		})
		for _, cl := range clients {
			fmt.Printf("\n%s %s\n", bold.Sprint(cl.Name), gray.Sprintf("(%s)", cl.ID))
			res, err := core.ListMcp(m, cl.ID, cwd)
			if err != nil {
				fmt.Printf("  %s %s\n", red.Sprint("✗"), err)
				continue
			}
			if p, ok := res["path"]; p == nil || ok && p == "" {
				fmt.Printf("  %s\n", gray.Sprint("no config path"))
				continue
			}
			if p, ok := res["path"].(string); ok {
				fmt.Printf("  %s\n", gray.Sprint(p))
			}
			if s, ok := res["servers"].(map[string]interface{}); ok {
				if len(s) == 0 {
					fmt.Printf("  %s\n", gray.Sprint("(empty)"))
					continue
				}
				for k := range s {
					fmt.Printf("  %s %s\n", green.Sprint("•"), k)
				}
			} else {
				fmt.Printf("  %s\n", gray.Sprint("(empty)"))
			}
		}
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}
