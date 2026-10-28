package core

import (
	"fmt"
)

func buildServerDef(entry map[string]interface{}) map[string]interface{} {
	def := map[string]interface{}{}
	if t, ok := entry["type"].(string); ok && t != "" && t != "stdio" {
		def["type"] = t
	}
	if c, ok := entry["command"].(string); ok {
		def["command"] = c
	}
	if a, ok := entry["args"]; ok {
		def["args"] = a
	}
	if e, ok := entry["env"]; ok {
		def["env"] = e
	}
	if u, ok := entry["url"].(string); ok {
		def["url"] = u
	}
	if h, ok := entry["headers"]; ok {
		def["headers"] = h
	}
	return def
}

func AddMcp(m *Mapping, reg map[string]interface{}, clientID, mcpID string, dryRun bool, cwd string) (map[string]interface{}, error) {
	c, ok := m.Clients[clientID]
	if !ok {
		return nil, fmt.Errorf("unknown client: %s", clientID)
	}
	// find mcp
	var entry map[string]interface{}
	if list, ok := reg["mcp"].([]interface{}); ok {
		for _, it := range list {
			if mm, ok := it.(map[string]interface{}); ok {
				if mm["id"] == mcpID {
					entry = mm
					break
				}
			}
		}
	}
	if entry == nil {
		return nil, fmt.Errorf("unknown mcp: %s", mcpID)
	}
	key := GetClientConfigKey(c)
	p := GetConfigPathForClient(m, clientID, "project", cwd)
	if p == "" {
		p = GetConfigPathForClient(m, clientID, "global", cwd)
	}
	if p == "" {
		return nil, fmt.Errorf("no config path for %s", clientID)
	}
	if c.Type == "json" {
		cfg, _ := ReadJSON(p)
		if _, ok := cfg[key].(map[string]interface{}); !ok {
			cfg[key] = map[string]interface{}{}
		}
		sec := cfg[key].(map[string]interface{})
		sec[entry["id"].(string)] = buildServerDef(entry)
		cfg[key] = sec
		if dryRun {
			return map[string]interface{}{"action": "add", "clientId": clientID, "mcpId": mcpID, "path": p, "preview": cfg}, nil
		}
		if err := WriteJSON(p, cfg); err != nil {
			return nil, err
		}
		return map[string]interface{}{"action": "add", "clientId": clientID, "mcpId": mcpID, "path": p}, nil
	} else if c.Type == "toml" {
		cfg, _ := ReadTOML(p)
		if _, ok := cfg[key].(map[string]interface{}); !ok {
			cfg[key] = map[string]interface{}{}
		}
		sec := cfg[key].(map[string]interface{})
		sec[entry["id"].(string)] = buildServerDef(entry)
		cfg[key] = sec
		if dryRun {
			return map[string]interface{}{"action": "add", "clientId": clientID, "mcpId": mcpID, "path": p, "preview": cfg}, nil
		}
		if err := WriteTOML(p, cfg); err != nil {
			return nil, err
		}
		return map[string]interface{}{"action": "add", "clientId": clientID, "mcpId": mcpID, "path": p}, nil
	}
	return nil, fmt.Errorf("unsupported type for %s", clientID)
}

func RemoveMcp(m *Mapping, clientID, mcpID string, dryRun bool, cwd string) (map[string]interface{}, error) {
	c, ok := m.Clients[clientID]
	if !ok {
		return nil, fmt.Errorf("unknown client: %s", clientID)
	}
	key := GetClientConfigKey(c)
	p := GetConfigPathForClient(m, clientID, "project", cwd)
	if p == "" {
		p = GetConfigPathForClient(m, clientID, "global", cwd)
	}
	if p == "" {
		return nil, fmt.Errorf("no config path for %s", clientID)
	}
	if c.Type == "json" {
		cfg, _ := ReadJSON(p)
		if sec, ok := cfg[key].(map[string]interface{}); ok {
			delete(sec, mcpID)
			cfg[key] = sec
		}
		if dryRun {
			return map[string]interface{}{"action": "remove", "clientId": clientID, "mcpId": mcpID, "path": p, "preview": cfg}, nil
		}
		if err := WriteJSON(p, cfg); err != nil {
			return nil, err
		}
		return map[string]interface{}{"action": "remove", "clientId": clientID, "mcpId": mcpID, "path": p}, nil
	} else if c.Type == "toml" {
		cfg, _ := ReadTOML(p)
		if sec, ok := cfg[key].(map[string]interface{}); ok {
			delete(sec, mcpID)
			cfg[key] = sec
		}
		if dryRun {
			return map[string]interface{}{"action": "remove", "clientId": clientID, "mcpId": mcpID, "path": p, "preview": cfg}, nil
		}
		if err := WriteTOML(p, cfg); err != nil {
			return nil, err
		}
		return map[string]interface{}{"action": "remove", "clientId": clientID, "mcpId": mcpID, "path": p}, nil
	}
	return nil, fmt.Errorf("unsupported type for %s", clientID)
}

func ListMcp(m *Mapping, clientID, cwd string) (map[string]interface{}, error) {
	c, ok := m.Clients[clientID]
	if !ok {
		return nil, fmt.Errorf("unknown client: %s", clientID)
	}
	key := GetClientConfigKey(c)
	p := GetConfigPathForClient(m, clientID, "project", cwd)
	if p == "" {
		p = GetConfigPathForClient(m, clientID, "global", cwd)
	}
	if p == "" {
		return map[string]interface{}{"clientId": clientID, "path": nil, "servers": map[string]interface{}{}}, nil
	}
	if c.Type == "json" {
		cfg, _ := ReadJSON(p)
		servers := map[string]interface{}{}
		if sec, ok := cfg[key].(map[string]interface{}); ok {
			servers = sec
		}
		return map[string]interface{}{"clientId": clientID, "path": p, "servers": servers}, nil
	} else if c.Type == "toml" {
		cfg, _ := ReadTOML(p)
		servers := map[string]interface{}{}
		if sec, ok := cfg[key].(map[string]interface{}); ok {
			servers = sec
		}
		return map[string]interface{}{"clientId": clientID, "path": p, "servers": servers}, nil
	}
	return map[string]interface{}{"clientId": clientID, "path": p, "servers": map[string]interface{}{}}, nil
}
