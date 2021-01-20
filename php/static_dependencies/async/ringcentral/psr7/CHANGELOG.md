# CHANGELOG

## 1.2.0 - 2015-08-15

* Body as `"0"` is now properly added to a response.
* Now allowing forward seeking in CachingStream.
* Now properly parsing HTTP requests that contain proxy targets in
  `parse_request`.
* functions.php is now conditionally required.
* user-info is no longer dropped when resolving URIs.

## 1.1.0 - 2015-06-24

* URIs can now be relative.
* `multipart/form-data` headers are now overridden case-insensitively.
* URI paths no longer encode the following characters because they are allowed
  in URIs: "(", ")", "*", "!", "'"
* A port is no longer added to a URI when the scheme is missing and no port is
  present.

## 1.0.0 - 2015-05-19

Initial release.

Currently unsupported:

- `Psr\Http\Message\ServerRequestInterface`
- `Psr\Http\Message\UploadedFileInterface`
