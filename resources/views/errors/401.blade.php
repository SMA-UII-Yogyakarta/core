@extends('errors::minimal')

@section('title', __('Tidak Diizinkan'))
@section('code', '401')
@section('icon', 'fas fa-lock')
@section('iconBg', 'bg-warning/10')
@section('message', __('Anda harus masuk terlebih dahulu untuk mengakses halaman ini.'))
@section('action', __('Ke Halaman Login'))
@section('route', '/login')
