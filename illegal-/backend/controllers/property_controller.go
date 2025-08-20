
package controllers

import (
    "net/http"
    "encoding/json"
    
    "backend/models"
    "backend/utils"
)

func GetProperties(w http.ResponseWriter, r *http.Request) {
    var properties []models.Property
    utils.DB.Find(&properties)
    json.NewEncoder(w).Encode(properties)
}

func CreateProperty(w http.ResponseWriter, r *http.Request) {
    var property models.Property
    json.NewDecoder(r.Body).Decode(&property)
    utils.DB.Create(&property)
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(property)
}