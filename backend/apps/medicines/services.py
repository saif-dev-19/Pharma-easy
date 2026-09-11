import io

import qrcode
from django.conf import settings


def generate_batch_qr(batch):
    qr_url = (
        f"{settings.FRONTEND_URL}/qr/{batch.qr_code}/"
    )

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )

    qr.add_data(qr_url)
    qr.make(fit=True)

    image = qr.make_image()

    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer