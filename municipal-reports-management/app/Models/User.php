<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'municipality_id', 'current_lat', 'current_lng',
        'national_id', 'phone', 'governorate', 'is_active', 'otp', 'otp_expires_at'
    ];

    protected $hidden = [
        'password', 'remember_token', 'otp'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class);
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    
    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    
    public function scopeByMunicipality($query, int $municipalityId)
    {
        return $query->where('municipality_id', $municipalityId);
    }
}