---
Task ID: 1
Agent: Main Agent
Task: Fix QR download, update free template color, replace WhatsApp with Telegram

Work Log:
- Investigated QR download issue: found html2canvas has SVG rendering issues with dangerouslySetInnerHTML
- Rewrote handleQrExport to pre-convert SVGs to images before html2canvas capture
- Removed is_pro gate that was blocking free users from downloading QR
- Added SVG-to-image conversion with proper backup/restore to preserve live preview
- Set backgroundColor to "#FFFFFF" (or "#14100B" for pesanlagi template) for reliable capture
- Added "PesanLagi" branded QR template with dark bg (#14100B) + orange gradient matching landing page
- Set pesanlagi as default QR template
- Added qrDisplayText/qrDisplayAccent derived variables for proper dark/light text
- Updated QR card to use orange gradient logo (from-orange-400 via-orange-500 to-orange-700) matching landing page
- Replaced WhatsApp CTA in modal-bantuan with Telegram (blue/sky theme, Telegram icon, link to t.me/+1N-IWILgR7tmODM1)
- Changed "Support Priority via WhatsApp" to "Support Priority via Telegram" in pricing
- Updated privacy policy contact to suportpesanlagi@gmail.com + Telegram link
- Updated footer bottom bar to show email + full address (Kebumen, Jawa Tengah, Indonesia)
- Verified: 0 WhatsApp links remain, 4 Telegram references, 3 email references, Kebumen address in footer
- All 3 legal pages already had correct contact blocks from previous session

Stage Summary:
- QR download fixed with SVG-to-image pre-processing for html2canvas compatibility
- Free QR template now defaults to "PesanLagi" theme (dark bg + orange, matches landing page)
- WhatsApp completely replaced with Telegram on landing page
- Footer updated with suportpesanlagi@gmail.com and Kebumen, Jawa Tengah, Indonesia
- Lint passes with 0 errors (1 pre-existing warning)
