package controllers

import (
    "encoding/json"
    "net/http"
    "fmt"
    "backend/models"
    "backend/utils"
    "github.com/gorilla/mux"
)

type Report struct {
    ID            string  `json:"id"`
    CitizenName   string  `json:"citizenName"`
    CitizenEmail  string  `json:"citizenEmail"`
    Location      string  `json:"location"`
    Coordinates   *struct {
        Lat float64 `json:"lat"`
        Lng float64 `json:"lng"`
    } `json:"coordinates,omitempty"`
    Description   string `json:"description"`
    Status        string `json:"status"`
    Priority      string `json:"priority"`
    CreatedAt     string `json:"createdAt"`
    UpdatedAt     string `json:"updatedAt"`
    ImageUrl      string `json:"imageUrl,omitempty"`
    Attachments   []string `json:"attachments,omitempty"`
}

type CreateReportRequest struct {
    Location      string  `json:"location"`
    Coordinates   *struct {
        Lat float64 `json:"lat"`
        Lng float64 `json:"lng"`
    } `json:"coordinates,omitempty"`
    Description   string `json:"description"`
    Priority      string `json:"priority"`
    Images        []string `json:"images,omitempty"`
}

func GetReports(w http.ResponseWriter, r *http.Request) {
    var complaints []models.Complaint
    if err := utils.DB.Find(&complaints).Error; err != nil {
        http.Error(w, "Failed to fetch reports", http.StatusInternalServerError)
        return
    }

    // Convert complaints to reports format
    var reports []Report
    for _, complaint := range complaints {
        report := Report{
            ID:           fmt.Sprintf("%d", complaint.ID),
            CitizenName:  complaint.CitizenName,
            CitizenEmail: complaint.CitizenEmail,
            Location:     complaint.Location,
            Description:  complaint.Description,
            Status:       complaint.Status,
            Priority:     "medium", // Default priority
            CreatedAt:    complaint.CreatedAt.Format("2006-01-02T15:04:05Z"),
            UpdatedAt:    complaint.UpdatedAt.Format("2006-01-02T15:04:05Z"),
        }
        reports = append(reports, report)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(reports)
}

func GetReport(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    var complaint models.Complaint
    if err := utils.DB.First(&complaint, id).Error; err != nil {
        http.Error(w, "Report not found", http.StatusNotFound)
        return
    }

    report := Report{
        ID:           fmt.Sprintf("%d", complaint.ID),
        CitizenName:  complaint.CitizenName,
        CitizenEmail: complaint.CitizenEmail,
        Location:     complaint.Location,
        Description:  complaint.Description,
        Status:       complaint.Status,
        Priority:     "medium",
        CreatedAt:    complaint.CreatedAt.Format("2006-01-02T15:04:05Z"),
        UpdatedAt:    complaint.UpdatedAt.Format("2006-01-02T15:04:05Z"),
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(report)
}

func CreateReport(w http.ResponseWriter, r *http.Request) {
    // Parse multipart form
    if err := r.ParseMultipartForm(32 << 20); err != nil {
        http.Error(w, "Failed to parse form", http.StatusBadRequest)
        return
    }

    // Extract form data
    location := r.FormValue("location")
    description := r.FormValue("description")
    priority := r.FormValue("priority")

    if location == "" || description == "" {
        http.Error(w, "Location and description are required", http.StatusBadRequest)
        return
    }

    // Create complaint (using existing model)
    complaint := models.Complaint{
        CitizenName:  "Anonymous", // Default value
        CitizenEmail: "anonymous@example.com", // Default value
        Location:     location,
        Description:  description,
        Status:       "pending",
    }

    if err := utils.DB.Create(&complaint).Error; err != nil {
        http.Error(w, "Failed to create report", http.StatusInternalServerError)
        return
    }

    // Convert to report format for response
    report := Report{
        ID:           fmt.Sprintf("%d", complaint.ID),
        CitizenName:  complaint.CitizenName,
        CitizenEmail: complaint.CitizenEmail,
        Location:     complaint.Location,
        Description:  complaint.Description,
        Status:       complaint.Status,
        Priority:     priority,
        CreatedAt:    complaint.CreatedAt.Format("2006-01-02T15:04:05Z"),
        UpdatedAt:    complaint.UpdatedAt.Format("2006-01-02T15:04:05Z"),
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(report)
}

func UpdateReportStatus(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    var statusUpdate struct {
        Status string `json:"status"`
    }
    if err := json.NewDecoder(r.Body).Decode(&statusUpdate); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    if statusUpdate.Status != "approved" && statusUpdate.Status != "rejected" {
        http.Error(w, "Invalid status", http.StatusBadRequest)
        return
    }

    var complaint models.Complaint
    if err := utils.DB.First(&complaint, id).Error; err != nil {
        http.Error(w, "Report not found", http.StatusNotFound)
        return
    }

    complaint.Status = statusUpdate.Status
    if err := utils.DB.Save(&complaint).Error; err != nil {
        http.Error(w, "Failed to update status", http.StatusInternalServerError)
        return
    }

    report := Report{
        ID:           fmt.Sprintf("%d", complaint.ID),
        CitizenName:  complaint.CitizenName,
        CitizenEmail: complaint.CitizenEmail,
        Location:     complaint.Location,
        Description:  complaint.Description,
        Status:       complaint.Status,
        Priority:     "medium",
        CreatedAt:    complaint.CreatedAt.Format("2006-01-02T15:04:05Z"),
        UpdatedAt:    complaint.UpdatedAt.Format("2006-01-02T15:04:05Z"),
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(report)
}

func DeleteReport(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    if err := utils.DB.Delete(&models.Complaint{}, id).Error; err != nil {
        http.Error(w, "Failed to delete report", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
} 