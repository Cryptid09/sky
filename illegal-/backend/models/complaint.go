package models

import "gorm.io/gorm"

// Complaint represents a citizen complaint
type Complaint struct {
    gorm.Model
    UserID         uint   `json:"user_id"`
    ConstructionID uint   `json:"construction_id"`
    CitizenName    string `json:"citizenName"`
    CitizenEmail   string `json:"citizenEmail"`
    Location       string `json:"location"`
    Description    string `json:"description"`
    Status         string `json:"status"` // "pending", "approved", "rejected"
}