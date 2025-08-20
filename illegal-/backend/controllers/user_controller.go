package controllers

import (
    "net/http"
    "encoding/json"
    "backend/models"
    "backend/utils"
)

func GetUsers(w http.ResponseWriter, r *http.Request) {
    var users []models.User
    utils.DB.Find(&users)
    json.NewEncoder(w).Encode(users)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
    var user models.User
    json.NewDecoder(r.Body).Decode(&user)
    utils.DB.Create(&user)
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}
