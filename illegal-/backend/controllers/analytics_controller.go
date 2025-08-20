package controllers

import (
    "encoding/json"
    "net/http"
    "time"
    "backend/models"
    "backend/utils"
)

type DashboardStats struct {
    TotalReports         int `json:"totalReports"`
    PendingReports       int `json:"pendingReports"`
    ApprovedReports      int `json:"approvedReports"`
    RejectedReports      int `json:"rejectedReports"`
    TotalEncroachments   int `json:"totalEncroachments"`
    NewEncroachments     int `json:"newEncroachments"`
    ResolvedEncroachments int `json:"resolvedEncroachments"`
    AlertsCount          int `json:"alertsCount"`
}

type TimelineData struct {
    Date  string `json:"date"`
    Count int    `json:"count"`
}

type RegionData struct {
    Region       string `json:"region"`
    Count        int    `json:"count"`
    Coordinates  struct {
        Lat float64 `json:"lat"`
        Lng float64 `json:"lng"`
    } `json:"coordinates"`
}

func GetDashboardStats(w http.ResponseWriter, r *http.Request) {
    var stats DashboardStats

    // Count complaints (reports)
    var totalComplaints int64
    utils.DB.Model(&models.Complaint{}).Count(&totalComplaints)
    stats.TotalReports = int(totalComplaints)

    var pendingComplaints int64
    utils.DB.Model(&models.Complaint{}).Where("status = ?", "pending").Count(&pendingComplaints)
    stats.PendingReports = int(pendingComplaints)

    var approvedComplaints int64
    utils.DB.Model(&models.Complaint{}).Where("status = ?", "approved").Count(&approvedComplaints)
    stats.ApprovedReports = int(approvedComplaints)

    var rejectedComplaints int64
    utils.DB.Model(&models.Complaint{}).Where("status = ?", "rejected").Count(&rejectedComplaints)
    stats.RejectedReports = int(rejectedComplaints)

    // Count constructions (encroachments)
    var totalConstructions int64
    utils.DB.Model(&models.Construction{}).Count(&totalConstructions)
    stats.TotalEncroachments = int(totalConstructions)

    // For now, assume all constructions are new
    stats.NewEncroachments = int(totalConstructions)
    stats.ResolvedEncroachments = 0

    // Count alerts
    var totalAlerts int64
    utils.DB.Model(&models.Alert{}).Count(&totalAlerts)
    stats.AlertsCount = int(totalAlerts)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(stats)
}

func GetReportsOverTime(w http.ResponseWriter, r *http.Request) {
    period := r.URL.Query().Get("period")
    if period == "" {
        period = "7d"
    }

    var days int
    switch period {
    case "7d":
        days = 7
    case "30d":
        days = 30
    case "90d":
        days = 90
    case "1y":
        days = 365
    default:
        days = 7
    }

    endDate := time.Now()
    startDate := endDate.AddDate(0, 0, -days)

    var complaints []models.Complaint
    utils.DB.Where("created_at BETWEEN ? AND ?", startDate, endDate).Find(&complaints)

    // Group by date
    dateCounts := make(map[string]int)
    for _, complaint := range complaints {
        date := complaint.CreatedAt.Format("2006-01-02")
        dateCounts[date]++
    }

    // Convert to timeline format
    var timeline []TimelineData
    for i := 0; i < days; i++ {
        date := startDate.AddDate(0, 0, i).Format("2006-01-02")
        count := dateCounts[date]
        timeline = append(timeline, TimelineData{
            Date:  date,
            Count: count,
        })
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(timeline)
}

func GetEncroachmentsByRegion(w http.ResponseWriter, r *http.Request) {
    var constructions []models.Construction
    utils.DB.Find(&constructions)

    // For now, group by location (assuming location is the region)
    regionCounts := make(map[string]int)
    for _, construction := range constructions {
        regionCounts[construction.Location]++
    }

    var regions []RegionData
    for region, count := range regionCounts {
        regionData := RegionData{
            Region: region,
            Count:  count,
            Coordinates: struct {
                Lat float64 `json:"lat"`
                Lng float64 `json:"lng"`
            }{
                Lat: 0.0, // Default coordinates
                Lng: 0.0,
            },
        }
        regions = append(regions, regionData)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(regions)
} 