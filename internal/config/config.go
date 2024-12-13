package config

import (
	"encoding/json"
	"os"
)

type ConfigS struct {
	Server struct {
		Protocol string `json:"protocol"`
		Host     string `json:"host"`
		Port     int    `json:"port"`
	}

	Database struct {
		Path   string `json:"path"`
		Schema string `json:"schema"`
	}
}

var Config *ConfigS

func LoadConfig() error {
	file := "./internal/config/config.json"
	configFile, err := os.Open(file)
	if err != nil {
		return err
	}
	defer configFile.Close()

	err = json.NewDecoder(configFile).Decode(&Config)
	if err != nil {
		return err
	}

	return nil
}
