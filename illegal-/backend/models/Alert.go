package models

import "gorm.io/gorm"

type Alert struct {
    gorm.Model
    Title       string `json:"title"`
    Description string `json:"description"`
    Location    string `json:"location"`
    Status      string `json:"status"`
    IsRead      bool   `json:"isRead" gorm:"default:false"`
}
