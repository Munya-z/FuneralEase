package com.funeralease.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val AppColorScheme = lightColorScheme(
    primary = DuskInk,
    onPrimary = WarmPaper,
    primaryContainer = DuskInkDark,
    onPrimaryContainer = WarmPaper,
    secondary = Candlewick,
    onSecondary = WarmPaper,
    secondaryContainer = Color(0xFFFDE68A),
    onSecondaryContainer = DuskInk,
    background = WarmPaper,
    onBackground = DuskInk,
    surface = WarmPaper,
    onSurface = DuskInk,
    surfaceVariant = Color(0xFFF5F5F0),
    onSurfaceVariant = Color(0xFF57534E),
    error = Ember,
    onError = WarmPaper,
    tertiary = Sage,
    onTertiary = WarmPaper,
)

@Composable
fun FuneralEaseTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AppColorScheme,
        content = content,
    )
}
