package com.example.hangout

data class HangoutCard(
    val id: String = "",
    val postedByName: String = "",
    val postedByUid: String = "",
    val activityType: String = "",
    val timeWindow: String = "",
    val locationLabel: String = "",
    val maxPeople: Int = 2,
    val currentPeople: Int = 1,
    val createdAt: Long = 0L,
    val expiresAt: Long = 0L
)