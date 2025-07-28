# Discord Bot Config Generator

A standalone web application that allows users to generate configuration files for the Deakin Discord Bot project without needing to dig into the code.

## 🚀 Quick Start

### For Users

1. **Visit the Site** - Go to the deployed GitHub Pages URL
2. **Configure Your Bot** - Fill in the bot customisation settings
3. **Add Environment Variables** - Enter your Discord bot token and server details
4. **Download Files** - Generate and download your configuration files
5. **Use in Your Project** - Place the files in your Discord bot project

## 🎛️ Configuration Options

### Bot Customisation

- **General Settings**: Bot name, colors, branding
- **Command Customisation**: Customise descriptions for all slash commands
- **Button Configuration**: Set up external links for the `/whoami` command
- **Message Customisation**: Welcome and verification messages

### Environment Variables

- **Required**: Discord token, server ID, role IDs
- **Optional**: Supabase credentials, web interface settings

## 🔧 How It Works

The application is built entirely with vanilla HTML, CSS, and JavaScript:

- **No Backend Required** - All processing happens in the browser
- **File Generation** - Uses the browser's Blob API to create downloadable files
- **Local Storage** - Automatically saves user progress
- **Responsive Design** - Works on all device sizes

## 🎨 Customisation

### Adding New Fields

To add new configuration options:

1. Add the HTML form elements in the appropriate section
2. Update the `getBotConfig()` or `getEnvConfig()` functions
3. Add the field to the localStorage save/load functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with vanilla web technologies for maximum compatibility
- Inspired by the need for a simple, no-setup configuration tool
- Designed to work seamlessly with the Discord Bot Generator project
