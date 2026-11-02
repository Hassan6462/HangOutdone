package com.example.hangout

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Gravity
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import android.widget.LinearLayout



class MessageAdapter(
    private val messages: List<Message>,
    private val currentUserId: String
) : RecyclerView.Adapter<MessageAdapter.MessageViewHolder>() {

    class MessageViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val senderName: TextView = view.findViewById(R.id.senderName)
        val messageText: TextView = view.findViewById(R.id.messageText)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MessageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_message, parent, false)
        return MessageViewHolder(view)
    }

    override fun onBindViewHolder(holder: MessageViewHolder, position: Int) {
        val message = messages[position]
        holder.senderName.text = if (message.senderId == currentUserId) "You" else message.senderName
        holder.messageText.text = message.text

        // Align own messages to the right
        val params = holder.messageText.layoutParams as ViewGroup.MarginLayoutParams
        if (message.senderId == currentUserId) {
            holder.messageText.setBackgroundColor(android.graphics.Color.parseColor("#FF7E5F"))
            holder.messageText.setTextColor(android.graphics.Color.WHITE)
            (holder.itemView as LinearLayout).gravity = Gravity.END
        } else {
            holder.messageText.setBackgroundColor(android.graphics.Color.WHITE)
            holder.messageText.setTextColor(android.graphics.Color.parseColor("#2D2640"))
            (holder.itemView as LinearLayout).gravity = Gravity.START
        }
    }

    override fun getItemCount() = messages.size
}