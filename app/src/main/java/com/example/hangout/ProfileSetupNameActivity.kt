package com.example.hangout

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.util.Calendar

class ProfileSetupNameActivity : AppCompatActivity() {

    private lateinit var firstNameInput: EditText
    private lateinit var lastNameInput: EditText
    private lateinit var dobPickerButton: Button
    private lateinit var nextButton: Button

    private var selectedDay = -1
    private var selectedMonth = -1
    private var selectedYear = -1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile_setup_name)

        firstNameInput = findViewById(R.id.firstNameInput)
        lastNameInput = findViewById(R.id.lastNameInput)
        dobPickerButton = findViewById(R.id.dobPickerButton)
        nextButton = findViewById(R.id.nextButton)

        dobPickerButton.setOnClickListener {
            showDatePicker()
        }

        nextButton.setOnClickListener {
            val firstName = firstNameInput.text.toString().trim()
            val lastName = lastNameInput.text.toString().trim()

            if (firstName.isEmpty()) {
                Toast.makeText(this, "Please enter your first name", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (lastName.isEmpty()) {
                Toast.makeText(this, "Please enter your last name", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (selectedYear == -1) {
                Toast.makeText(this, "Please select your date of birth", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val age = calculateAge(selectedYear, selectedMonth, selectedDay)

            if (age < 15) {
                Toast.makeText(this, "You must be at least 15 to use HangOut", Toast.LENGTH_LONG).show()
                return@setOnClickListener
            }

            val intent = Intent(this, ProfileSetupPhotoActivity::class.java)
            intent.putExtra("firstName", firstName)
            intent.putExtra("lastName", lastName)
            intent.putExtra("fullName", "$firstName $lastName")
            intent.putExtra("dobDay", selectedDay)
            intent.putExtra("dobMonth", selectedMonth)
            intent.putExtra("dobYear", selectedYear)
            intent.putExtra("age", age)
            startActivity(intent)
        }
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.YEAR, -20)

        val datePickerDialog = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                selectedYear = year
                selectedMonth = month
                selectedDay = dayOfMonth

                val displayMonth = month + 1
                dobPickerButton.text = "$dayOfMonth/$displayMonth/$year"
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )

        datePickerDialog.datePicker.maxDate = System.currentTimeMillis()
        datePickerDialog.show()
    }

    private fun calculateAge(year: Int, month: Int, day: Int): Int {
        val today = Calendar.getInstance()
        var age = today.get(Calendar.YEAR) - year
        if (today.get(Calendar.MONTH) < month ||
            (today.get(Calendar.MONTH) == month && today.get(Calendar.DAY_OF_MONTH) < day)
        ) {
            age--
        }
        return age
    }
}