<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'priority',
        'status',
        'location_lat',
        'location_lng',
        'address',
        'user_id',
        'municipality_id',
        'assigned_to',
        'is_anonymous',
        'official_comment',
        'images'
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'images' => 'array'
    ];

    protected $attributes = [
        'status' => 'pending',
        'priority' => 'medium',
        'is_anonymous' => false
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    
    public function canBeUpdatedBy(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        
        if ($user->hasRole('citizen')) {
            return $this->user_id === $user->id && 
                   !in_array($this->status, ['processing', 'on-hold', 'resolved']);
        }
        
        if ($user->hasRole('municipality')) {
            return $this->municipality_id === $user->municipality_id && 
                   ($this->assigned_to === $user->id || $this->assigned_to === null);
        }
        
        return false;
    }

    
    public function canBeDeletedBy(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }
        
        if ($user->hasRole('citizen')) {
            return $this->user_id === $user->id && 
                   !in_array($this->status, ['processing', 'on-hold', 'resolved']);
        }
        
        return false;
    }
    
}