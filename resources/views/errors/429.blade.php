@extends('errors::minimal')

@section('title', __('Terlalu Banyak Permintaan'))
@section('code', '429')
@section('icon', 'fas fa-hourglass-half')
@section('iconBg', 'bg-warning/10')
@section('message', __('Terlalu banyak permintaan dalam waktu singkat. Silakan tunggu beberapa saat dan coba lagi.'))
@section('route', '/')
