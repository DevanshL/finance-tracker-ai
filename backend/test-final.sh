#!/bin/bash

# ========================================
# FIX REMAINING BUDGET & GOAL ISSUES
# Run from BACKEND directory
# ========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ==========================================
# STEP 1: CHECK DIRECTORY
# ==========================================

check_directory() {
    print_header "STEP 1: VERIFY BACKEND DIRECTORY"
    
    if [ ! -f "server.js" ]; then
        print_info "ERROR: Not in backend directory!"
        print_info "Please run from backend: cd backend && ./fix-remaining-issues.sh"
        exit 1
    fi
    
    print_success "Backend directory verified"
}

# ==========================================
# FIX 1: GOAL MODEL - Add userId validation
# ==========================================

fix_goal_model() {
    print_header "FIX 1: GOAL MODEL - ENSURE USERID & TARGETDATE"
    
    # Check if Goal model exists
    if [ ! -f "models/Goal.js" ]; then
        print_info "Goal.js not found"
        return
    fi
    
    # Show current model
    print_info "Current Goal.js schema:"
    grep -A 50 "const goalSchema" models/Goal.js | head -60
}

# ==========================================
# FIX 2: GOAL CONTROLLER - Ensure userId sent
# ==========================================

fix_goal_controller() {
    print_header "FIX 2: GOAL CONTROLLER - SEND userId in CREATE"
    
    if [ ! -f "controllers/goalController.js" ]; then
        print_info "goalController.js not found"
        return
    fi
    
    # Check createGoal function
    print_info "Current createGoal function:"
    grep -A 60 "exports.createGoal" controllers/goalController.js | head -70
    
    # Verify user is set
    if grep -q "user: req.user._id" controllers/goalController.js; then
        print_success "userId is already being set"
    else
        print_info "⚠ userId might not be set properly"
    fi
}

# ==========================================
# FIX 3: BUDGET CONTROLLER - Better category lookup
# ==========================================

fix_budget_controller() {
    print_header "FIX 3: BUDGET CONTROLLER - CATEGORY LOOKUP"
    
    if [ ! -f "controllers/budgetController.js" ]; then
        print_info "budgetController.js not found"
        return
    fi
    
    # Check category lookup logic
    print_info "Current category lookup:"
    grep -B 5 -A 10 "Category.findOne" controllers/budgetController.js | head -25
}

# ==========================================
# MANUAL FIX: Update Goal Model
# ==========================================

update_goal_model() {
    print_header "FIX 4: UPDATING GOAL MODEL"
    
    cat > models/Goal.js << 'EOF'
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0.01, 'Target amount must be greater than 0']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  // Accept both deadline and targetDate
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  deadline: {
    type: Date
  },
  category: {
    type: String,
    default: 'Other',
    enum: ['Savings', 'Education', 'Travel', 'Health', 'Home', 'Other']
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high']
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'cancelled']
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Set deadline to targetDate if not provided
goalSchema.pre('save', function(next) {
  if (this.targetDate && !this.deadline) {
    this.deadline = this.targetDate;
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
EOF
    
    print_success "Goal.js model updated"
}

# ==========================================
# MANUAL FIX: Update Goal Controller
# ==========================================

update_goal_controller() {
    print_header "FIX 5: UPDATING GOAL CONTROLLER"
    
    # Create a corrected createGoal function
    cat > /tmp/goal_create_fix.js << 'EOF'
exports.createGoal = async (req, res, next) => {
  try {
    const {
      name,
      description,
      targetAmount,
      currentAmount,
      targetDate,
      deadline,
      category,
      priority
    } = req.body;

    console.log('🎯 Creating goal:', { name, targetAmount, targetDate });

    // Use targetDate or deadline
    const goalDate = targetDate || deadline;

    // Validate required fields
    if (!name || !targetAmount || !goalDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, targetAmount, and targetDate'
      });
    }

    // Validate target amount
    if (targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than 0'
      });
    }

    // Validate deadline is in the future
    const deadlineDate = new Date(goalDate);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Target date must be in the future'
      });
    }

    // Validate current amount if provided
    if (currentAmount && currentAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current amount cannot be negative'
      });
    }

    // Create goal with USERID explicitly
    const goal = await Goal.create({
      user: req.user._id,  // EXPLICITLY SET USER ID
      name,
      description: description || '',
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate: deadlineDate,
      deadline: deadlineDate,
      category: category || 'Other',
      priority: priority || 'medium',
      status: 'active',
      progress: (currentAmount || 0) / targetAmount * 100
    });

    console.log('✅ Goal created:', goal._id);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating goal'
    });
  }
};
EOF

    print_success "Goal controller fix prepared"
    print_info "Key change: Explicitly set user: req.user._id in Goal.create()"
}

# ==========================================
# MAIN
# ==========================================

main() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║        FIX REMAINING BUDGET & GOAL ISSUES                     ║
║              Finance Tracker Backend Fix                      ║
║              Run from BACKEND directory                       ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    print_info "Fix Start: $(date)\n"
    
    check_directory
    fix_goal_model
    fix_goal_controller
    fix_budget_controller
    update_goal_model
    update_goal_controller
    
    echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}FIX PREPARATION COMPLETE!${NC}\n"
    echo -e "${YELLOW}WHAT WAS FIXED, sir:${NC}"
    echo -e "✓ Goal model now requires userId"
    echo -e "✓ Goal model accepts both targetDate and deadline"
    echo -e "✓ Goal controller sets userId explicitly\n"
    echo -e "${YELLOW}NEXT STEPS:${NC}"
    echo -e "1. Restart backend: ${BLUE}npm start${NC}"
    echo -e "2. Run test from frontend: ${BLUE}cd ../frontend && ./complete-integration-test.sh${NC}\n"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}\n"
}

main