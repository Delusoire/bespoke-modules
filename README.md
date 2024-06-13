```pwsh
Get-ChildItem -Path dist/modules | ForEach-Object {
	& spicetify pkg install $_.FullName
}
```
