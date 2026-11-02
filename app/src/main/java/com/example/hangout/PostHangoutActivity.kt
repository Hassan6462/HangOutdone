package com.example.hangout

import android.Manifest
import android.content.pm.PackageManager
import android.location.Geocoder
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.Locale

class PostHangoutActivity : AppCompatActivity() {

    private lateinit var activityChipGroup: ChipGroup
    private lateinit var timeChipGroup: ChipGroup
    private lateinit var peopleChipGroup: ChipGroup
    private lateinit var locationText: TextView
    private lateinit var refreshLocationText: TextView
    private lateinit var postButton: Button
    private lateinit var postingSpinner: ProgressBar

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    private var detectedLocationLabel = "Nearby"
    private var detectedLat = 0.0
    private var detectedLng = 0.0

    private val activityTypes = listOf(
        "⚽ Football", "🏏 Cricket", "🏸 Badminton",
        "☕ Coffee", "🍕 Food", "🚶 Walk",
        "🎮 Gaming", "📚 Study", "🎬 Movie",
        "✈️ Travel", "🎵 Music", "🏋️ Gym"
    )

    private val timeWindows = listOf(
        "Right now", "In 1 hour", "This evening", "Tomorrow"
    )

    private val peopleOptions = listOf(
        "Just 1 other person", "Small group (3-4)"
    )

    companion object {
        private const val LOCATION_PERMISSION_REQUEST = 1001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_post_hangout)

        activityChipGroup = findViewById(R.id.activityChipGroup)
        timeChipGroup = findViewById(R.id.timeChipGroup)
        peopleChipGroup = findViewById(R.id.peopleChipGroup)
        locationText = findViewById(R.id.locationDetectedText)
        refreshLocationText = findViewById(R.id.refreshLocationText)
        postButton = findViewById(R.id.postButton)
        postingSpinner = findViewById(R.id.postingSpinner)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        buildChips(activityChipGroup, activityTypes)
        buildChips(timeChipGroup, timeWindows)
        buildChips(peopleChipGroup, peopleOptions)

        detectLocation()

        refreshLocationText.setOnClickListener {
            detectLocation()
        }

        postButton.setOnClickListener {
            postHangout()
        }
    }

    private fun buildChips(group: ChipGroup, items: List<String>) {
        items.forEach { item ->
            val chip = Chip(this)
            chip.text = item
            chip.isCheckable = true
            chip.isCheckedIconVisible = true
            chip.setChipBackgroundColorResource(android.R.color.white)
            chip.setTextColor(getColor(android.R.color.black))
            chip.chipStrokeWidth = 2f
            chip.chipStrokeColor = android.content.res.ColorStateList.valueOf(
                android.graphics.Color.parseColor("#DDDDDD")
            )
            group.addView(chip)
        }
    }

    private fun detectLocation() {
        locationText.text = "📍 Detecting your location..."

        if (ActivityCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ),
                LOCATION_PERMISSION_REQUEST
            )
            return
        }

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    detectedLat = location.latitude
                    detectedLng = location.longitude
                    reverseGeocode(location.latitude, location.longitude)
                } else {
                    locationText.text = "📍 Couldn't detect location — tap Refresh"
                }
            }
            .addOnFailureListener {
                locationText.text = "📍 Location error — tap Refresh"
            }
    }

    private fun reverseGeocode(lat: Double, lng: Double) {
        try {
            val geocoder = Geocoder(this, Locale.getDefault())
            val addresses = geocoder.getFromLocation(lat, lng, 1)
            if (!addresses.isNullOrEmpty()) {
                val address = addresses[0]
                detectedLocationLabel = address.subLocality
                    ?: address.locality
                            ?: address.adminArea
                            ?: "Nearby"
                locationText.text = "📍 $detectedLocationLabel"
            }
        } catch (e: Exception) {
            locationText.text = "📍 Location detected"
            detectedLocationLabel = "Nearby"
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            detectLocation()
        } else {
            locationText.text = "📍 Location permission denied"
        }
    }

    private fun getSelectedChipText(group: ChipGroup): String? {
        val selectedId = group.checkedChipId
        if (selectedId == View.NO_ID) return null
        return findViewById<Chip>(selectedId)?.text?.toString()
    }

    private fun postHangout() {
        val activityType = getSelectedChipText(activityChipGroup)
        val timeWindow = getSelectedChipText(timeChipGroup)
        val peopleOption = getSelectedChipText(peopleChipGroup)

        if (activityType == null) {
            Toast.makeText(this, "Please select an activity", Toast.LENGTH_SHORT).show()
            return
        }
        if (timeWindow == null) {
            Toast.makeText(this, "Please select a time", Toast.LENGTH_SHORT).show()
            return
        }
        if (peopleOption == null) {
            Toast.makeText(this, "Please select how many people", Toast.LENGTH_SHORT).show()
            return
        }

        val currentUser = auth.currentUser
        if (currentUser == null) {
            Toast.makeText(this, "Please sign in first", Toast.LENGTH_SHORT).show()
            return
        }

        postButton.isEnabled = false
        postingSpinner.visibility = View.VISIBLE

        // Get poster's name from Firestore
        db.collection("users").document(currentUser.uid).get()
            .addOnSuccessListener { userDoc ->
                val posterName = userDoc.getString("firstName") ?: "Someone"
                val maxPeople = if (peopleOption.contains("1")) 2 else 4

                // Calculate expiry time based on selected window
                val expiresAt = when {
                    timeWindow.contains("now") -> System.currentTimeMillis() + (30 * 60 * 1000) // 30 mins
                    timeWindow.contains("1 hour") -> System.currentTimeMillis() + (2 * 60 * 60 * 1000) // 2 hrs
                    timeWindow.contains("evening") -> System.currentTimeMillis() + (6 * 60 * 60 * 1000) // 6 hrs
                    else -> System.currentTimeMillis() + (24 * 60 * 60 * 1000) // 24 hrs
                }

                val hangout = hashMapOf(
                    "postedByUid" to currentUser.uid,
                    "postedByName" to posterName,
                    "activityType" to activityType,
                    "timeWindow" to timeWindow,
                    "locationLabel" to detectedLocationLabel,
                    "lat" to detectedLat,
                    "lng" to detectedLng,
                    "maxPeople" to maxPeople,
                    "currentPeople" to 1,
                    "createdAt" to System.currentTimeMillis(),
                    "expiresAt" to expiresAt
                )

                db.collection("hangouts")
                    .add(hangout)
                    .addOnSuccessListener {
                        postingSpinner.visibility = View.GONE
                        postButton.isEnabled = true
                        Toast.makeText(
                            this,
                            "Hangout posted! 🎉 People nearby will see it now.",
                            Toast.LENGTH_LONG
                        ).show()
                        finish() // Go back to feed
                    }
                    .addOnFailureListener { e ->
                        postingSpinner.visibility = View.GONE
                        postButton.isEnabled = true
                        Toast.makeText(
                            this,
                            "Failed to post: ${e.message}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
            }
    }
}