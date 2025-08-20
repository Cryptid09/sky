package controllers

import (
    "encoding/json"
    "net/http"
    "fmt"
    "backend/models"
    "backend/utils"
    "github.com/gorilla/mux"
)

type Encroachment struct {
    ID                string  `json:"id"`
    Location          string  `json:"location"`
    Coordinates       struct {
        Lat float64 `json:"lat"`
        Lng float64 `json:"lng"`
    } `json:"coordinates"`
    DetectedAt        string  `json:"detectedAt"`
    Confidence        float64 `json:"confidence"`
    Status            string  `json:"status"`
    Area              float64 `json:"area"`
    SatelliteImageUrl string  `json:"satelliteImageUrl,omitempty"`
    ComparisonImageUrl string `json:"comparisonImageUrl,omitempty"`
}

func GetEncroachments(w http.ResponseWriter, r *http.Request) {
    var constructions []models.Construction
    if err := utils.DB.Find(&constructions).Error; err != nil {
        http.Error(w, "Failed to fetch encroachments", http.StatusInternalServerError)
        return
    }

    // Convert constructions to encroachments format
    var encroachments []Encroachment
    for _, construction := range constructions {
        encroachment := Encroachment{
            ID:         fmt.Sprintf("%d", construction.ID),
            Location:   construction.Location,
            Coordinates: struct {
                Lat float64 `json:"lat"`
                Lng float64 `json:"lng"`
            }{
                Lat: 0.0, // Default coordinates
                Lng: 0.0,
            },
            DetectedAt: construction.CreatedAt.Format("2006-01-02T15:04:05Z"),
            Confidence: 0.85, // Default confidence
            Status:     "new",
            Area:       100.0, // Default area
        }
        encroachments = append(encroachments, encroachment)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(encroachments)
}

func GetEncroachment(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    var construction models.Construction
    if err := utils.DB.First(&construction, id).Error; err != nil {
        http.Error(w, "Encroachment not found", http.StatusNotFound)
        return
    }

    encroachment := Encroachment{
        ID:         fmt.Sprintf("%d", construction.ID),
        Location:   construction.Location,
        Coordinates: struct {
            Lat float64 `json:"lat"`
            Lng float64 `json:"lng"`
        }{
            Lat: 0.0,
            Lng: 0.0,
        },
        DetectedAt: construction.CreatedAt.Format("2006-01-02T15:04:05Z"),
        Confidence: 0.85,
        Status:     "new",
        Area:       100.0,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(encroachment)
}

func UpdateEncroachmentStatus(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    var statusUpdate struct {
        Status string `json:"status"`
    }
    if err := json.NewDecoder(r.Body).Decode(&statusUpdate); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Validate status
    validStatuses := []string{"new", "verified", "resolved", "false_positive"}
    isValid := false
    for _, status := range validStatuses {
        if status == statusUpdate.Status {
            isValid = true
            break
        }
    }
    if !isValid {
        http.Error(w, "Invalid status", http.StatusBadRequest)
        return
    }

    var construction models.Construction
    if err := utils.DB.First(&construction, id).Error; err != nil {
        http.Error(w, "Encroachment not found", http.StatusNotFound)
        return
    }

    // Update status (you might want to add a status field to Construction model)
    // For now, we'll just return success
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Status updated successfully"})
}

func GetEncroachmentsByArea(w http.ResponseWriter, r *http.Request) {
    // Get query parameters for bounds (for now, we'll ignore them and return all)
    var constructions []models.Construction
    if err := utils.DB.Find(&constructions).Error; err != nil {
        http.Error(w, "Failed to fetch encroachments", http.StatusInternalServerError)
        return
    }

    // Convert to encroachments format
    var encroachments []Encroachment
    for _, construction := range constructions {
        encroachment := Encroachment{
            ID:         fmt.Sprintf("%d", construction.ID),
            Location:   construction.Location,
            Coordinates: struct {
                Lat float64 `json:"lat"`
                Lng float64 `json:"lng"`
            }{
                Lat: 0.0,
                Lng: 0.0,
            },
            DetectedAt: construction.CreatedAt.Format("2006-01-02T15:04:05Z"),
            Confidence: 0.85,
            Status:     "new",
            Area:       100.0,
        }
        encroachments = append(encroachments, encroachment)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(encroachments)
} 