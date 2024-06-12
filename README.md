```pwsh
Get-ChildItem -Path . -Filter metadata.json -Recurse | ForEach-Object {
	& spicetify pkg install $_.FullName
}
```
