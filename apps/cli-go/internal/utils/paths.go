package utils

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

func ExpandHome(p string) string {
	if p == "" {
		return p
	}
	if strings.HasPrefix(p, "~") {
		home, err := os.UserHomeDir()
		if err != nil {
			return p
		}
		if len(p) == 1 {
			return home
		}
		return filepath.Join(home, strings.TrimPrefix(p, "~/"))
	}
	return p
}

func ExpandEnv(p string) string {
	if p == "" {
		return p
	}
	res := p
	// %VAR%
	re := regexp.MustCompile(`%([^%]+)%`)
	res = re.ReplaceAllStringFunc(res, func(m string) string {
		key := m[1 : len(m)-1]
		if v := os.Getenv(key); v != "" {
			return v
		}
		return m
	})
	// ${VAR}
	re2 := regexp.MustCompile(`\$\{([^}]+)\}`)
	res = re2.ReplaceAllStringFunc(res, func(m string) string {
		key := m[2 : len(m)-1]
		if v := os.Getenv(key); v != "" {
			return v
		}
		return m
	})
	// $VAR
	re3 := regexp.MustCompile(`\$([A-Z_][A-Z0-9_]*)`)
	res = re3.ReplaceAllStringFunc(res, func(m string) string {
		key := m[1:]
		if v := os.Getenv(key); v != "" {
			return v
		}
		return m
	})
	return res
}

func ResolvePath(p string) string {
	return ExpandHome(ExpandEnv(p))
}
