package com.example.hangout

data class Message(
    val id: String = "",
    val senderId: String = "",
    val senderName: String = "",
    val text: String = "",
    val sentAt: Long = 0L
)