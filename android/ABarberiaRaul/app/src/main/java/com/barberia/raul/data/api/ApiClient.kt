package com.barberia.raul.data.api

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val BASE_URL = "https://script.google.com/macros/s/AKfycbw8ivDBXhIEjtgRM1MFp5pUEH1Nfr5ApSjSqvP5mlJ4IntyySB8wzo3JnCQsdES8Oo/"

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .build()

    val api: BarberiaApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .build()
            .create(BarberiaApi::class.java)
    }
}
