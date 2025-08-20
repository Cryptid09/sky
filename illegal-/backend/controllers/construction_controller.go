package controllers

import (
    "net/http"
    "encoding/json"
    "strconv"
    "github.com/gorilla/mux"
    "backend/models"
    "backend/utils"
)

func GetConstructions(w http.ResponseWriter, r *http.Request) {
    var constructions []models.Construction
    utils.DB.Find(&constructions)
    json.NewEncoder(w).Encode(constructions)
}

func GetConstruction(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    var construction models.Construction
    id, _ := strconv.Atoi(params["id"])
    utils.DB.First(&construction, id)
    json.NewEncoder(w).Encode(construction)
}

func CreateConstruction(w http.ResponseWriter, r *http.Request) {
    var construction models.Construction
    json.NewDecoder(r.Body).Decode(&construction)
    utils.DB.Create(&construction)
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(construction)
}

func UpdateConstruction(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    var construction models.Construction
    id, _ := strconv.Atoi(params["id"])
    utils.DB.First(&construction, id)
    json.NewDecoder(r.Body).Decode(&construction)
    utils.DB.Save(&construction)
    json.NewEncoder(w).Encode(construction)
}

func DeleteConstruction(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, _ := strconv.Atoi(params["id"])
    utils.DB.Delete(&models.Construction{}, id)
    w.WriteHeader(http.StatusNoContent)
}