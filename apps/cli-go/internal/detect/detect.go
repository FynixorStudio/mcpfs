package detect

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/mcpfs/mcpfs/apps/cli-go/internal/core"
	"github.com/mcpfs/mcpfs/apps/cli-go/internal/utils"
)

type FoundPath struct {
	Type string `json:"type"`
	Path string `json:"path"`
}

type ClientResult struct {
	ID       string      `json:"id"`
	Name     string      `json:"name"`
	Type     string      `json:"type"`
	Key      string      `json:"key"`
	Priority int         `json:"priority"`
	Found    bool        `json:"found"`
	Paths    []FoundPath `json:"paths"`
}

type RunnerDetail struct {
	Type string `json:"type"`
	Name string `json:"name,omitempty"`
	Path string `json:"path,omitempty"`
}

type RunnerResult struct {
	ID      string         `json:"id"`
	Name    string         `json:"name"`
	Found   bool           `json:"found"`
	Details []RunnerDetail `json:"details"`
}

type Result struct {
	Clients  []ClientResult `json:"clients"`
	Runners  []RunnerResult `json:"runners"`
	Platform string         `json:"platform"`
	Cwd      string         `json:"cwd"`
	Homedir  string         `json:"homedir"`
}

func Run() (*Result, error) {
	m, err := core.LoadMapping()
	if err != nil {
		return nil, err
	}
	plat := runtime.GOOS
	cwd, _ := os.Getwd()
	home, _ := os.UserHomeDir()

	res := &Result{
		Platform: plat,
		Cwd:      cwd,
		Homedir:  home,
	}

	// clients
	for _, c := range m.Clients {
		cr := ClientResult{
			ID:       c.ID,
			Name:     c.Name,
			Type:     c.Type,
			Key:      c.Key,
			Priority: c.Priority,
			Found:    false,
			Paths:    []FoundPath{},
		}
		// global
		if g, ok := c.Paths["global"]; ok {
			switch v := g.(type) {
			case []interface{}:
				for _, gp := range v {
					if gs, ok := gp.(string); ok {
						rp := utils.ResolvePath(gs)
						if _, err := os.Stat(rp); err == nil {
							cr.Found = true
							cr.Paths = append(cr.Paths, FoundPath{Type: "global", Path: rp})
						}
					}
				}
			case map[string]interface{}:
				if gp, ok := v[plat]; ok {
					if gs, ok := gp.(string); ok {
						rp := utils.ResolvePath(gs)
						if _, err := os.Stat(rp); err == nil {
							cr.Found = true
							cr.Paths = append(cr.Paths, FoundPath{Type: "global", Path: rp})
						}
					}
				}
			}
		}
		// project
		if p, ok := c.Paths["project"]; ok {
			if arr, ok := p.([]interface{}); ok {
				for _, pp := range arr {
					if ps, ok := pp.(string); ok {
						rp := filepath.Join(cwd, ps)
						if _, err := os.Stat(rp); err == nil {
							cr.Found = true
							cr.Paths = append(cr.Paths, FoundPath{Type: "project", Path: rp})
						}
					}
				}
			}
		}
		res.Clients = append(res.Clients, cr)
	}

	// runners
	for _, r := range m.Runners {
		rr := RunnerResult{ID: r.ID, Name: r.Name, Found: false, Details: []RunnerDetail{}}
		for _, cand := range r.Detect {
			if strings.Contains(cand, "/") || strings.Contains(cand, "\\") || strings.HasPrefix(cand, "~") || strings.Contains(cand, "%") {
				rp := utils.ResolvePath(cand)
				if _, err := os.Stat(rp); err == nil {
					rr.Found = true
					rr.Details = append(rr.Details, RunnerDetail{Type: "path", Path: rp})
					continue
				}
			} else {
				// try bin
				if _, err := exec.LookPath(cand); err == nil {
					rr.Found = true
					rr.Details = append(rr.Details, RunnerDetail{Type: "bin", Name: cand})
					continue
				}
				// try --version quick
				if out, err := exec.Command(cand, "--version").CombinedOutput(); err == nil && len(out) > 0 {
					rr.Found = true
					rr.Details = append(rr.Details, RunnerDetail{Type: "bin", Name: cand})
					continue
				}
				if plat == "windows" {
					if out, err := exec.Command("where", cand).CombinedOutput(); err == nil && len(out) > 0 {
						rr.Found = true
						rr.Details = append(rr.Details, RunnerDetail{Type: "bin", Name: cand})
						continue
					}
				} else {
					if out, err := exec.Command("which", cand).CombinedOutput(); err == nil && len(out) > 0 {
						rr.Found = true
						rr.Details = append(rr.Details, RunnerDetail{Type: "bin", Name: cand})
						continue
					}
				}
			}
		}
		res.Runners = append(res.Runners, rr)
	}

	return res, nil
}
