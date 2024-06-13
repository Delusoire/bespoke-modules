```pwsh
Get-ChildItem -Path modules | ForEach-Object {
	& spicetify pkg install $_.FullName
}
```
