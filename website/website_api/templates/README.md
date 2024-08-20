# Templates

### Information

This is where the template for the PDF export of a user's list will be stored.

`list_template.html` is the HTML base, later converted to PDF.

Any change to the PDF export format will be here and it is fed to the `/lists/<int:list_id>/items` route in the website's API (backend)