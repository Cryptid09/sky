package controllers

import (
	"backend/models"
	"backend/utils"
	"encoding/json"
	"net/http"
	"github.com/gorilla/mux"
)

func GetAlerts(w http.ResponseWriter, r *http.Request) {
	var alerts []models.Alert
	utils.DB.Find(&alerts)
	json.NewEncoder(w).Encode(alerts)
}

func CreateAlert(w http.ResponseWriter, r *http.Request) {
	var alert models.Alert
	json.NewDecoder(r.Body).Decode(&alert)
	utils.DB.Create(&alert)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(alert)
}

func MarkAlertRead(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var alert models.Alert
	if err := utils.DB.First(&alert, id).Error; err != nil {
		http.Error(w, "Alert not found", http.StatusNotFound)
		return
	}

	alert.IsRead = true
	utils.DB.Save(&alert)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Alert marked as read"})
}

func MarkAllAlertsRead(w http.ResponseWriter, r *http.Request) {
	utils.DB.Model(&models.Alert{}).Update("is_read", true)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "All alerts marked as read"})
}

func GetUnreadAlertsCount(w http.ResponseWriter, r *http.Request) {
	var count int64
	utils.DB.Model(&models.Alert{}).Where("is_read = ?", false).Count(&count)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]int64{"count": count})
}
