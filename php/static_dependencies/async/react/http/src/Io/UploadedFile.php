<?php

namespace React\Http\Io;

use Psr\Http\Message\StreamInterface;
use Psr\Http\Message\UploadedFileInterface;
use InvalidArgumentException;
use RuntimeException;

/**
 * [Internal] Implementation of the PSR-7 `UploadedFileInterface`
 *
 * This is used internally to represent each incoming file upload.
 *
 * Note that this is an internal class only and nothing you should usually care
 * about. See the `UploadedFileInterface` for more details.
 *
 * @see UploadedFileInterface
 * @internal
 */
final class UploadedFile implements UploadedFileInterface
{
    /**
     * @var StreamInterface
     */
    private $stream;

    /**
     * @var int
     */
    private $size;

    /**
     * @var int
     */
    private $error;

    /**
     * @var string
     */
    private $filename;

    /**
     * @var string
     */
    private $mediaType;

    /**
     * @param StreamInterface $stream
     * @param int $size
     * @param int $error
     * @param string $filename
     * @param string $mediaType
     */
    public function __construct(StreamInterface $stream, $size, $error, $filename, $mediaType)
    {
        $this->stream = $stream;
        $this->size = $size;

        if (!\is_int($error) || !\in_array($error, array(
            \UPLOAD_ERR_OK,
            \UPLOAD_ERR_INI_SIZE,
            \UPLOAD_ERR_FORM_SIZE,
            \UPLOAD_ERR_PARTIAL,
            \UPLOAD_ERR_NO_FILE,
            \UPLOAD_ERR_NO_TMP_DIR,
            \UPLOAD_ERR_CANT_WRITE,
            \UPLOAD_ERR_EXTENSION,
        ))) {
            throw new InvalidArgumentException(
                'Invalid error code, must be an UPLOAD_ERR_* constant'
            );
        }
        $this->error = $error;
        $this->filename = $filename;
        $this->mediaType = $mediaType;
    }

    /**
     * {@inheritdoc}
     */
    public function getStream()
    {
        if ($this->error !== \UPLOAD_ERR_OK) {
            throw new RuntimeException('Cannot retrieve stream due to upload error');
        }

        return $this->stream;
    }

    /**
     * {@inheritdoc}
     */
    public function moveTo($targetPath)
    {
       throw new RuntimeException('Not implemented');
    }

    /**
     * {@inheritdoc}
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * {@inheritdoc}
     */
    public function getError()
    {
        return $this->error;
    }

    /**
     * {@inheritdoc}
     */
    public function getClientFilename()
    {
        return $this->filename;
    }

    /**
     * {@inheritdoc}
     */
    public function getClientMediaType()
    {
        return $this->mediaType;
    }
}
