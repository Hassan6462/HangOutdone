package com.example.hangout

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class HangoutCardAdapter(
    private val cards: List<HangoutCard>,
    private val onImInClicked: (HangoutCard) -> Unit
) : RecyclerView.Adapter<HangoutCardAdapter.CardViewHolder>() {

    class CardViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val activityTag: TextView = view.findViewById(R.id.activityTag)
        val timeTag: TextView = view.findViewById(R.id.timeTag)
        val postedBy: TextView = view.findViewById(R.id.postedBy)
        val locationText: TextView = view.findViewById(R.id.locationText)
        val spotsText: TextView = view.findViewById(R.id.spotsText)
        val imInButton: Button = view.findViewById(R.id.imInButton)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CardViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_hangout_card, parent, false)
        return CardViewHolder(view)
    }

    override fun onBindViewHolder(holder: CardViewHolder, position: Int) {
        val card = cards[position]

        holder.activityTag.text = card.activityType
        holder.timeTag.text = card.timeWindow
        holder.postedBy.text = "${card.postedByName} wants to ${card.activityType.lowercase()}"
        holder.locationText.text = "📍 ${card.locationLabel}"

        val spotsLeft = card.maxPeople - card.currentPeople
        holder.spotsText.text = if (spotsLeft == 1) "1 spot left" else "$spotsLeft spots left"

        holder.imInButton.setOnClickListener {
            onImInClicked(card)
        }
        // Tap card to view poster's profile
        holder.itemView.setOnClickListener {
            val context = holder.itemView.context
            val intent = android.content.Intent(context, UserProfileActivity::class.java)
            intent.putExtra("userId", card.postedByUid)
            context.startActivity(intent)
        }
    }

    override fun getItemCount() = cards.size
}