@extends('errors::minimal')

@section('title', __('Layanan Tidak Tersedia'))
@section('code', '503')
@section('icon', 'fas fa-tools')
@section('iconBg', 'bg-warning/10')
@section('message', __('Layanan sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.'))
@section('route', '/')
