package com.funeralease.app.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.funeralease.app.R
import com.funeralease.app.ui.theme.FuneralEaseTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.Theme_FuneralEase)
        super.onCreate(savedInstanceState)
        setContent {
            FuneralEaseTheme {
                AppNavigation()
            }
        }
    }
}
