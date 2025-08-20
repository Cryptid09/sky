package controllers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"backend/models"
	"backend/utils"

	"github.com/gorilla/mux"
	"gorm.io/datatypes"
)

// GetReports returns all reports
func GetReports(w http.ResponseWriter, r *http.Request) {
	var reports []models.Report
	if err := utils.DB.Order("created_at desc").Find(&reports).Error; err != nil {
		http.Error(w, "failed to fetch reports", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reports)
}

// GetReport returns a single report by id
func GetReport(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var report models.Report
	if err := utils.DB.First(&report, id).Error; err != nil {
		http.Error(w, "report not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

// CreateReport handles multipart/form-data report creation and saves image files to ./uploads
func CreateReport(w http.ResponseWriter, r *http.Request) {
	// limit parsing size (e.g. 32MB)
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		http.Error(w, "failed to parse form", http.StatusBadRequest)
		return
	}

	location := r.FormValue("location")
	description := r.FormValue("description")
	priority := r.FormValue("priority")
	coordStr := r.FormValue("coordinates") // optional JSON string

	// collect image URLs
	imageURLs := []string{}
	uploadsDir := "uploads"
	_ = os.MkdirAll(uploadsDir, 0755)

	if r.MultipartForm != nil && r.MultipartForm.File != nil {
		files := r.MultipartForm.File["images"]
		for _, fh := range files {
			src, err := fh.Open()
			if err != nil {
				continue
			}
			defer src.Close()

			// create unique filename
			name := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(fh.Filename))
			dstPath := filepath.Join(uploadsDir, name)
			dst, err := os.Create(dstPath)
			if err != nil {
				continue
			}
			_, _ = io.Copy(dst, src)
			_ = dst.Close()

			// store URL relative to server root
			imageURLs = append(imageURLs, "/uploads/"+name)
		}
	}

	coordsJSON := datatypes.JSON([]byte("null"))
	if coordStr != "" {
		coordsJSON = datatypes.JSON([]byte(coordStr))
	}

	imagesJSON, _ := json.Marshal(imageURLs)

	report := models.Report{
		Location:    location,
		Description: description,
		Priority:    priority,
		Coordinates: coordsJSON,
		Images:      datatypes.JSON(imagesJSON),
		Status:      "pending",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := utils.DB.Create(&report).Error; err != nil {
		http.Error(w, "failed to create report", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(report)
}

// UpdateReportStatus updates status field of a report
func UpdateReportStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	var report models.Report
	if err := utils.DB.First(&report, id).Error; err != nil {
		http.Error(w, "report not found", http.StatusNotFound)
		return
	}

	report.Status = payload.Status
	report.UpdatedAt = time.Now()
	if err := utils.DB.Save(&report).Error; err != nil {
		http.Error(w, "failed to update report", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(report)
}

// DeleteReport deletes a report
func DeleteReport(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	if err := utils.DB.Delete(&models.Report{}, id).Error; err != nil {
		http.Error(w, "failed to delete report", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
