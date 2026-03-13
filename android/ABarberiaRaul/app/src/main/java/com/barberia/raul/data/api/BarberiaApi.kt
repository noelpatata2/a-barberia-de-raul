package com.barberia.raul.data.api

import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*

interface BarberiaApi {
    @POST("exec")
    @Headers("Content-Type: text/plain;charset=utf-8")
    suspend fun postAction(@Body body: RequestBody): Response<ResponseBody>

    @GET("exec")
    suspend fun getAction(
        @QueryMap params: Map<String, String>
    ): Response<ResponseBody>
}
