package com.example.hangout

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

class ProfileSetupPhotoActivity : AppCompatActivity() {

    private lateinit var profilePhotoPreview: ImageView
    private lateinit var photoPlaceholderText: TextView

    private var selectedPhotoUri: Uri? = null

    // Modern way to launch the gallery picker and get a result back
    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            selectedPhotoUri = uri
            profilePhotoPreview.setImageURI(uri)
            photoPlaceholderText.visibility = android.view.View.GONE
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile_setup_photo)

        profilePhotoPreview = findViewById(R.id.profilePhotoPreview)
        photoPlaceholderText = findViewById(R.id.photoPlaceholderText)
        val choosePhotoButton = findViewById<android.widget.Button>(R.id.choosePhotoButton)
        val nextButton = findViewById<android.widget.Button>(R.id.nextButtonPhoto)
        val skipText = findViewById<TextView>(R.id.skipPhotoText)

        choosePhotoButton.setOnClickListener {
            pickImageLauncher.launch("image/*")
        }

        nextButton.setOnClickListener {
            goToInterestsScreen()
        }

        skipText.setOnClickListener {
            selectedPhotoUri = null
            goToInterestsScreen()
        }
    }

    private fun goToInterestsScreen() {
        val intent = Intent(this, ProfileSetupInterestsActivity::class.java)

        // Carry forward everything from the previous screen
        intent.putExtra("firstName", getIntent().getStringExtra("firstName"))
        intent.putExtra("lastName", getIntent().getStringExtra("lastName"))
        intent.putExtra("fullName", getIntent().getStringExtra("fullName"))
        intent.putExtra("dobDay", getIntent().getIntExtra("dobDay", -1))
        intent.putExtra("dobMonth", getIntent().getIntExtra("dobMonth", -1))
        intent.putExtra("dobYear", getIntent().getIntExtra("dobYear", -1))
        intent.putExtra("age", getIntent().getIntExtra("age", -1))

        // Photo URI as a string (Uri itself isn't directly Intent-safe across some Android versions)
        intent.putExtra("photoUri", selectedPhotoUri?.toString())

        startActivity(intent)
    }
}