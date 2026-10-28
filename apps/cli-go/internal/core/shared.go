package core

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"
)

type Mapping struct {
	Version int                 `json:"version"`
	Clients map[string]Client   `json:"clients"`
	Runners map[string]Runner   `json:"runners"`
}

type Client struct {
	ID       string                 `json:"id"`
	Name     string                 `json:"name"`
	Type     string                 `json:"type"`
	Key      string                 `json:"key"`
	Priority int                    `json:"priority"`
	Paths    map[string]interface{} `json:"paths"`
}

type Runner struct {
	ID     string   `json:"id"`
	Name   string   `json:"name"`
	Detect []string `json:"detect"`
}

func GetSharedDir() string {
	// apps/cli-go/internal/core -> up to mcpfs/shared
	_, filename, _, _ := runtime.Caller(0)
	dir := filepath.Dir(filename)
	shared := filepath.Join(dir, "..", "..", "..", "..", "shared")
	return filepath.Clean(shared)
}

func LoadMapping() (*Mapping, error) {
	p := filepath.Join(GetSharedDir(), "mapping.json")
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	var m Mapping
	if err := json.Unmarshal(b, &m); err != nil {
		return nil, err
	}
	return &m, nil
}

func LoadRegistry() (map[string]interface{}, error) {
	p := filepath.Join(GetSharedDir(), "registry.json")
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	var r map[string]interface{}
	if err := json.Unmarshal(b, &r); err != nil {
		return nil, err
	}
	return r, nil
}
