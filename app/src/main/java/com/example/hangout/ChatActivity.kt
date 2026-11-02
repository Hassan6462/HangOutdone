package com.example.hangout

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class ChatActivity : AppCompatActivity() {

    private lateinit var messagesRecyclerView: RecyclerView
    private lateinit var messageInput: EditText
    private lateinit var sendButton: Button
    private lateinit var chatTitle: TextView
    private lateinit var chatSubtitle: TextView
    private lateinit var emojiButton: TextView
    private lateinit var photoButton: TextView
    private lateinit var backButton: TextView

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    private val messages = mutableListOf<Message>()
    private lateinit var adapter: MessageAdapter

    private var hangoutId: String = ""
    private var hangoutActivity: String = ""
    private var currentUserName: String = ""

    // Common emojis to insert
    private val emojis = listOf("😄", "👍", "🔥", "❤️", "😂", "🎉", "👏", "😎", "🤝", "⚽")
    private var emojiIndex = 0

    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            // For now send image URI as a message text
            // Full Firebase Storage upload comes later
            sendImageMessage(uri.toString())
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
        // Fix keyboard pushing input off screen
        // Reliable keyboard fix for all Android versions
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content)) { view, insets ->
            val imeHeight = insets.getInsets(WindowInsetsCompat.Type.ime()).bottom
            val navHeight = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            view.setPadding(0, 0, 0, if (imeHeight > 0) imeHeight - navHeight else 0)
            insets
        }

        window.setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)

        messagesRecyclerView = findViewById(R.id.messagesRecyclerView)
        messageInput = findViewById(R.id.messageInput)
        sendButton = findViewById(R.id.sendButton)
        chatTitle = findViewById(R.id.chatTitle)
        chatSubtitle = findViewById(R.id.chatSubtitle)
        emojiButton = findViewById(R.id.emojiButton)
        photoButton = findViewById(R.id.photoButton)
        backButton = findViewById(R.id.backButton)

        hangoutId = intent.getStringExtra("hangoutId") ?: ""
        hangoutActivity = intent.getStringExtra("activityType") ?: "Hangout"

        chatTitle.text = hangoutActivity
        chatSubtitle.text = "Plan your meetup here"

        backButton.setOnClickListener { finish() }

        // Cycle through emojis on tap
        emojiButton.setOnClickListener {
            val emoji = emojis[emojiIndex % emojis.size]
            messageInput.append(emoji)
            emojiIndex++
        }

        photoButton.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }

        val currentUser = auth.currentUser ?: return

        db.collection("users").document(currentUser.uid).get()
            .addOnSuccessListener { doc ->
                currentUserName = doc.getString("firstName") ?: "You"

                adapter = MessageAdapter(messages, currentUser.uid)
                messagesRecyclerView.layoutManager = LinearLayoutManager(this).apply {
                    stackFromEnd = true
                }
                messagesRecyclerView.adapter = adapter

                listenForMessages()
            }

        sendButton.setOnClickListener {
            sendMessage()
        }

        // Long press on message → delete options (coming after basic chat works)
    }

    private fun listenForMessages() {
        if (hangoutId.isEmpty()) return

        db.collection("hangouts")
            .document(hangoutId)
            .collection("messages")
            .orderBy("sentAt", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener

                messages.clear()
                snapshot?.documents?.forEach { doc ->
                    val message = doc.toObject(Message::class.java)?.copy(id = doc.id)
                    if (message != null) messages.add(message)
                }

                adapter.notifyDataSetChanged()
                if (messages.isNotEmpty()) {
                    messagesRecyclerView.scrollToPosition(messages.size - 1)
                }
            }
    }

    private fun sendMessage() {
        val text = messageInput.text.toString().trim()
        if (text.isEmpty()) return

        val currentUser = auth.currentUser ?: return

        val message = hashMapOf(
            "senderId" to currentUser.uid,
            "senderName" to currentUserName,
            "text" to text,
            "type" to "text",
            "sentAt" to System.currentTimeMillis()
        )

        db.collection("hangouts")
            .document(hangoutId)
            .collection("messages")
            .add(message)
            .addOnSuccessListener {
                messageInput.text.clear()
            }
            .addOnFailureListener {
                Toast.makeText(this, "Failed to send", Toast.LENGTH_SHORT).show()
            }
    }

    private fun sendImageMessage(imageUri: String) {
        val currentUser = auth.currentUser ?: return

        val message = hashMapOf(
            "senderId" to currentUser.uid,
            "senderName" to currentUserName,
            "text" to "📷 Photo",
            "imageUri" to imageUri,
            "type" to "image",
            "sentAt" to System.currentTimeMillis()
        )

        db.collection("hangouts")
            .document(hangoutId)
            .collection("messages")
            .add(message)
            .addOnSuccessListener {
                Toast.makeText(this, "Photo shared!", Toast.LENGTH_SHORT).show()
            }
    }
}