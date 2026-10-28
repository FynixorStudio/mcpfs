package core

import (
	"encoding/json"
	"os"
	"path/filepath"
	"runtime"

	"github.com/mcpfs/mcpfs/apps/cli-go/internal/utils"
	"github.com/pelletier/go-toml/v2"
)

func ReadJSON(p string) (map[string]interface{}, error) {
	res := map[string]interface{}{}
	if _, err := os.Stat(p); os.IsNotExist(err) {
		return res, nil
	}
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	if len(b) == 0 {
		return res, nil
	}
	if err := json.Unmarshal(b, &res); err != nil {
		return res, nil
	}
	return res, nil
}

func WriteJSON(p string, data map[string]interface{}) error {
	if err := os.MkdirAll(filepath.Dir(p), 0755); err != nil {
		return err
	}
	b, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}
	b = append(b, '\n')
	return os.WriteFile(p, b, 0644)
}

func ReadTOML(p string) (map[string]interface{}, error) {
	res := map[string]interface{}{}
	if _, err := os.Stat(p); os.IsNotExist(err) {
		return res, nil
	}
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	if len(b) == 0 {
		return res, nil
	}
	if err := toml.Unmarshal(b, &res); err != nil {
		return res, nil
	}
	return res, nil
}

func WriteTOML(p string, data map[string]interface{}) error {
	if err := os.MkdirAll(filepath.Dir(p), 0755); err != nil {
		return err
	}
	b, err := toml.Marshal(data)
	if err != nil {
		return err
	}
	return os.WriteFile(p, b, 0644)
}

func GetClientConfigKey(c Client) string {
	if c.Key != "" {
		return c.Key
	}
	return "mcpServers"
}

func GetConfigPathForClient(m *Mapping, clientID string, prefer string, cwd string) string {
	c, ok := m.Clients[clientID]
	if !ok {
		return ""
	}
	plat := runtime.GOOS
	if prefer == "global" {
		if g, ok := c.Paths["global"]; ok {
			switch v := g.(type) {
			case []interface{}:
				if len(v) > 0 {
					// return first, prefer existing? but just first
					if gs, ok := v[0].(string); ok {
						return utils.ResolvePath(gs)
					}
				}
			case map[string]interface{}:
				if gp, ok := v[plat]; ok {
					if gs, ok := gp.(string); ok {
						return utils.ResolvePath(gs)
					}
				}
			}
		}
		if p, ok := c.Paths["project"]; ok {
			if arr, ok := p.([]interface{}); ok && len(arr) > 0 {
				if ps, ok := arr[0].(string); ok {
					return filepath.Join(cwd, ps)
				}
			}
		}
	} else {
		if p, ok := c.Paths["project"]; ok {
			if arr, ok := p.([]interface{}); ok && len(arr) > 0 {
				if ps, ok := arr[0].(string); ok {
					return filepath.Join(cwd, ps)
				}
			}
		}
		if g, ok := c.Paths["global"]; ok {
			switch v := g.(type) {
			case []interface{}:
				if len(v) > 0 {
					if gs, ok := v[0].(string); ok {
						return utils.ResolvePath(gs)
					}
				}
			case map[string]interface{}:
				if gp, ok := v[plat]; ok {
					if gs, ok := gp.(string); ok {
						return utils.ResolvePath(gs)
					}
				}
			}
		}
	}
	return ""
}
