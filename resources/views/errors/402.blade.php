@extends('errors::minimal')

@section('title', __('Pembayaran Diperlukan'))
@section('code', '402')
@section('icon', 'fas fa-money-bill-wave')
@section('iconBg', 'bg-warning/10')
@section('message', __('Halaman ini memerlukan pembayaran untuk dapat diakses.'))
@section('route', '/')
