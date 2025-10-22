# AI-Powered Telegram Group Moderation

Your M4Capital bot now includes advanced AI-powered moderation to keep your Telegram groups safe and spam-free!

## 🛡️ Features

### Automatic AI Moderation
- **Real-time content analysis** using OpenAI's moderation API
- **Spam detection** - Identifies promotional spam and scams
- **Toxicity detection** - Flags harassment, hate speech, and inappropriate content
- **Phishing protection** - Detects suspicious links and scam attempts
- **Smart warnings** - Progressive warning system before banning

### Detection Categories
The AI automatically detects and removes:
- ❌ Harassment and hate speech
- ❌ Sexual content
- ❌ Violence and self-harm
- ❌ Spam and promotional messages
- ❌ Scams and phishing
- ❌ Off-topic spam

## 🎮 Admin Commands

### `/ban`
Ban a user from the group.
- **Usage**: Reply to the user's message and type `/ban`
- **Effect**: User is immediately banned and message is deleted
- **Requirement**: Bot must have admin rights

### `/warn [reason]`
Give a warning to a user.
- **Usage**: Reply to the user's message and type `/warn` or `/warn Reason here`
- **Effect**: User receives a warning. After 3 warnings, automatic ban
- **Example**: `/warn No promotional links allowed`

### `/modstatus`
Check moderation settings and status.
- **Usage**: Type `/modstatus` in the group
- **Shows**: Current settings, thresholds, and available commands

## ⚙️ Configuration

Current settings in `route.ts`:

```typescript
const MODERATION_CONFIG = {
  MAX_WARNINGS: 3,              // Number of warnings before auto-ban
  AUTO_BAN_ENABLED: true,       // Enable automatic banning
  AUTO_MODERATE_GROUPS: true,   // Enable AI moderation in groups
  TOXICITY_THRESHOLD: 0.7,      // Sensitivity (0-1, higher = stricter)
};
```

### Adjusting Settings

**More Lenient** (fewer false positives):
```typescript
TOXICITY_THRESHOLD: 0.85,  // Only ban very obvious violations
MAX_WARNINGS: 5,           // More chances before ban
```

**Stricter** (zero tolerance):
```typescript
TOXICITY_THRESHOLD: 0.5,   // Flag more content
MAX_WARNINGS: 1,           // One strike and you're out
```

## 🚀 Setup Instructions

### 1. Add Bot to Group
1. Add your bot to the Telegram group
2. Make sure bot is an admin

### 2. Configure Bot Privacy
Talk to @BotFather on Telegram:
```
/setprivacy
Select your bot
Choose "Disable"
```
This allows the bot to read all messages (required for moderation).

### 3. Set Admin Permissions
Give the bot these admin permissions:
- ✅ Delete messages
- ✅ Ban users
- ✅ Invite users (optional)

### 4. Test the Bot
1. Send `/modstatus` to verify settings
2. Test with sample violations
3. Try `/warn` and `/ban` commands

## 📊 How It Works

### Message Flow
```
1. User sends message in group
   ↓
2. Bot receives message via webhook
   ↓
3. AI analyzes content (OpenAI Moderation API + GPT-4o-mini)
   ↓
4. If flagged:
   - Delete message
   - Severity HIGH → Immediate ban
   - Severity MEDIUM/LOW → Warning
   ↓
5. Track warnings per user
   ↓
6. Auto-ban after MAX_WARNINGS reached
```

### Severity Levels

**HIGH** (Immediate Ban):
- Extreme hate speech
- Severe harassment
- Dangerous content
- Confidence score > 0.9

**MEDIUM** (Warning):
- Moderate spam
- Suspicious links
- Promotional content
- Confidence score 0.7-0.9

**LOW** (Warning):
- Mild violations
- Borderline content
- Confidence score < 0.7

## 🔒 Privacy & Data

- Message content is sent to OpenAI for analysis
- No messages are stored permanently
- User warnings stored in memory (cleared on restart)
- For production, use a database to persist warnings

## 💡 Tips

### For Group Admins
1. **Test first** - Add bot to test group before main group
2. **Monitor initially** - Watch for false positives in first 24 hours
3. **Adjust threshold** - Fine-tune `TOXICITY_THRESHOLD` based on your community
4. **Announce** - Tell members about AI moderation to set expectations

### Best Practices
- Pin a message explaining group rules
- Use `/modstatus` to show members the bot is active
- Review bot behavior regularly
- Adjust settings based on group size and activity

### Handling False Positives
If the bot flags legitimate content:
1. Adjust `TOXICITY_THRESHOLD` higher (e.g., 0.8 or 0.9)
2. Check OpenAI moderation categories
3. Whitelist specific phrases if needed

## 🆘 Troubleshooting

### Bot doesn't respond to commands
- Ensure bot is admin
- Check privacy mode is disabled (`/setprivacy`)
- Verify webhook is set up: visit `/api/telegram-webhook/setup`

### Bot doesn't delete messages
- Bot needs "Delete messages" admin permission
- Check Vercel logs for errors

### Too many false positives
- Increase `TOXICITY_THRESHOLD` from 0.7 to 0.8 or 0.9
- Reduce AI analysis, rely more on OpenAI Moderation API only

### Bot bans legitimate users
- Increase `MAX_WARNINGS` to give more chances
- Review and adjust severity thresholds in code

## 🔄 Updates

To modify settings:
1. Edit `MODERATION_CONFIG` in `src/app/api/telegram-webhook/route.ts`
2. Commit and push changes
3. Vercel will auto-deploy

## 📝 Example Scenarios

**Scenario 1: Spam Link**
```
User: "Check out this amazing crypto pump! bit.ly/scam123"
Bot: [Deletes message]
     ⚠️ Warning 1/3 for @user
     Reason: Potential spam detected
```

**Scenario 2: Harassment**
```
User: [Offensive message]
Bot: [Deletes message]
     🚫 User @user has been banned.
     Reason: Flagged for harassment
```

**Scenario 3: Admin Ban**
```
Admin: [Replies to user's message] /ban
Bot: 🔨 User @spammer has been banned by admin.
```

## 🎯 Advanced: Custom Rules

You can add custom moderation rules in the `moderateContent` function:

```typescript
// Example: Block specific keywords
const blockedKeywords = ['pump', 'dump', 'get rich quick'];
const lowerText = text.toLowerCase();

for (const keyword of blockedKeywords) {
  if (lowerText.includes(keyword)) {
    return {
      shouldModerate: true,
      reason: `Contains blocked keyword: ${keyword}`,
      severity: "medium"
    };
  }
}
```

## 📞 Support

For issues or questions:
1. Check Vercel logs for errors
2. Test with `/modstatus` command
3. Review this documentation
4. Check OpenAI API status

---

**Your group is now protected by AI! 🛡️**
