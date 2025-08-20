
package controllers

import (
    "net/http"
    "encoding/json"
    "backend/models"
    "backend/utils"
)

func GetComplaints(w http.ResponseWriter, r *http.Request) {
    var complaints []models.Complaint
    utils.DB.Find(&complaints)
    json.NewEncoder(w).Encode(complaints)
}

func CreateComplaint(w http.ResponseWriter, r *http.Request) {
    var complaint models.Complaint
    json.NewDecoder(r.Body).Decode(&complaint)
    utils.DB.Create(&complaint)
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(complaint)
}