package cmd

import (
	"fmt"
	"sort"

	"github.com/fatih/color"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/detect"
	"github.com/spf13/cobra"
)

var detectCmd = &cobra.Command{
	Use:   "detect",
	Short: "Detect available AI clients & local runners",
	Run: func(cmd *cobra.Command, args []string) {
		cyan := color.New(color.FgCyan)
		gray := color.New(color.FgHiBlack)
		green := color.New(color.FgGreen)
		bold := color.New(color.Bold)

		res, err := detect.Run()
		if err != nil {
			red := color.New(color.FgRed)
			fmt.Println(red.Sprint("Error:"), err)
			return
		}

		fmt.Println(cyan.Sprint("mcpfs detect"))
		fmt.Println(gray.Sprintf("platform: %s | cwd: %s", res.Platform, res.Cwd))
		fmt.Println("")

		fmt.Println(bold.Sprint("Clients:"))
		// sort by priority then name
		sort.Slice(res.Clients, func(i, j int) bool {
			if res.Clients[i].Priority != res.Clients[j].Priority {
				return res.Clients[i].Priority < res.Clients[j].Priority
			}
			return res.Clients[i].Name < res.Clients[j].Name
		})
		for _, cl := range res.Clients {
			if cl.Found {
				fmt.Printf("  %s %s %s\n", green.Sprint("✓"), cl.Name, gray.Sprintf("(%s)", cl.ID))
				for _, p := range cl.Paths {
					fmt.Printf("      %s %s\n", gray.Sprint(p.Type+":"), p.Path)
				}
			} else {
				fmt.Printf("  %s %s %s\n", gray.Sprint("○"), gray.Sprint(cl.Name), gray.Sprintf("(%s)", cl.ID))
			}
		}
		fmt.Println("")

		fmt.Println(bold.Sprint("Runners:"))
		for _, r := range res.Runners {
			if r.Found {
				fmt.Printf("  %s %s %s\n", green.Sprint("✓"), r.Name, gray.Sprintf("(%s)", r.ID))
				for _, d := range r.Details {
					if d.Type == "bin" {
						fmt.Printf("      %s %s\n", gray.Sprint("bin:"), d.Name)
					}
					if d.Type == "path" {
						fmt.Printf("      %s %s\n", gray.Sprint("path:"), d.Path)
					}
				}
			} else {
				fmt.Printf("  %s %s %s\n", gray.Sprint("○"), gray.Sprint(r.Name), gray.Sprintf("(%s)", r.ID))
			}
		}
		fmt.Println("")
		fmt.Println(gray.Sprint("Tip: run `mcpfs add` to add MCPs from curated registry"))
	},
}

func init() {
	rootCmd.AddCommand(detectCmd)
}
