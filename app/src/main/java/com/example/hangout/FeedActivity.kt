package com.example.hangout
import android.content.Intent

import android.graphics.Color
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.tabs.TabLayout
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

class FeedActivity : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var postFab: FloatingActionButton

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    private val hangoutCards = mutableListOf<HangoutCard>()
    private lateinit var adapter: HangoutCardAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.parseColor("#2D2640")

        setContentView(R.layout.activity_feed)

        recyclerView = findViewById(R.id.hangoutRecyclerView)
        postFab = findViewById(R.id.postHangoutFab)

        // Tab toggle — find it safely
        val viewToggle = findViewById<TabLayout?>(R.id.viewToggle)
        viewToggle?.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                if (tab?.position == 1) {
                    Toast.makeText(this@FeedActivity, "Map view — coming soon!", Toast.LENGTH_SHORT).show()
                }
            }
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })

        // Setup RecyclerView
        adapter = HangoutCardAdapter(hangoutCards) { card ->
            onImInClicked(card)
        }
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter

        postFab.setOnClickListener {
            val intent = Intent(this, PostHangoutActivity::class.java)
            startActivity(intent)
        }

        loadHangoutCards()
        // Auto-refresh when returning from PostHangoutActivity
    }
    override fun onResume() {
        super.onResume()
        loadHangoutCards()
    }

    private fun loadHangoutCards() {
        db.collection("hangouts")
            .whereGreaterThan("expiresAt", System.currentTimeMillis())
            .get()
            .addOnSuccessListener { documents ->
                hangoutCards.clear()
                for (doc in documents) {
                    val card = doc.toObject(HangoutCard::class.java).copy(id = doc.id)
                    hangoutCards.add(card)
                }

                if (hangoutCards.isEmpty()) {
                    Toast.makeText(
                        this,
                        "No hangouts nearby yet — be the first to post one!",
                        Toast.LENGTH_LONG
                    ).show()
                }

                adapter.notifyDataSetChanged()
            }
            .addOnFailureListener { e ->
                Toast.makeText(this, "Failed to load: ${e.message}", Toast.LENGTH_SHORT).show()
            }
    }

    private fun onImInClicked(card: HangoutCard) {
        val currentUser = auth.currentUser ?: return

        if (card.postedByUid == currentUser.uid) {
            Toast.makeText(this, "This is your own hangout!", Toast.LENGTH_SHORT).show()
            return
        }

        // Save join request to Firestore
        val joinRequest = hashMapOf(
            "userId" to currentUser.uid,
            "hangoutId" to card.id,
            "joinedAt" to System.currentTimeMillis()
        )

        db.collection("hangouts")
            .document(card.id)
            .collection("joinRequests")
            .document(currentUser.uid)
            .set(joinRequest)
            .addOnSuccessListener {
                // Open chat screen
                val intent = Intent(this, ChatActivity::class.java)
                intent.putExtra("hangoutId", card.id)
                intent.putExtra("activityType", card.activityType)
                startActivity(intent)
            }
            .addOnFailureListener {
                Toast.makeText(this, "Couldn't join: ${it.message}", Toast.LENGTH_SHORT).show()
            }
    }
}