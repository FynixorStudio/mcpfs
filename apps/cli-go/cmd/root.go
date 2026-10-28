package cmd

import (
	"fmt"

	"github.com/fatih/color"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:     "mcpfs",
	Short:   "Manage MCP servers across AI clients & local runners",
	Long:    "mcpfs helps you detect, add, sync and remove MCP configs across Claude Code, Cursor, OpenCode, Codex, Claude Desktop and more.",
	Version: "0.0.1",
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		c := color.New(color.FgRed)
		fmt.Println(c.Sprint(err))
	}
}

func init() {
	rootCmd.SetVersionTemplate("mcpfs version {{.Version}}\n")
}
