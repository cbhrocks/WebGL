GLuint texture[1];
double angle = 0;
typedef struct{
	int X;
	int Y;
	int X;
	double U;
	double V;
}VERTICES;

const PI = Math.PI
const space = 10;
const VertexCount = (90/spcace)*(360/space)*4;
VERTICES VERTEX[VertexCount]

glEnable(GL_DEPTH_TEST);
glEnable( GL_TEXTURE_2D );
glDepthFunc(GL_LEQUAL);
glCullFace(GL_BACK);
glFrontFace(GL_CCW);
glEnable(GL_CULL_FACE);

texture[0] = LoadTextureRAW( “texture.raw” );

CreateSphere(70,0,0,0);

void CreateSphere (double R, double H, double K, double Z) {
	int n;
	double a;
	double b;

	n = 0;

	for( b = 0; b <= 90 – space; b+=space){

		for( a = 0; a <= 360 – space; a+=space){

			VERTEX[n].X = R * sin((a) / 180 * PI) * sin((b) / 180 * PI) – H;
			VERTEX[n].Y = R * cos((a) / 180 * PI) * sin((b) / 180 * PI) + K;
			VERTEX[n].Z = R * cos((b) / 180 * PI) – Z;

			VERTEX[n].V = (2 * b) / 360;
			VERTEX[n].U = (a) / 360;

			n++;

			VERTEX[n].X = R * sin((a) / 180 * PI) * sin((b + space) / 180 * PI) – H;
			VERTEX[n].Y = R * cos((a) / 180 * PI) * sin((b + space) / 180 * PI) + K;
			VERTEX[n].Z = R * cos((b + space) / 180 * PI) – Z;
			VERTEX[n].V = (2 * (b + space)) / 360;
			VERTEX[n].U = (a) / 360;
			n++;

			VERTEX[n].X = R * sin((a + space) / 180 * PI) * sin((b) / 180 * PI) – H;
			VERTEX[n].Y = R * cos((a + space) / 180 * PI) * sin((b) / 180 * PI) + K;
			VERTEX[n].Z = R * cos((b) / 180 * PI) – Z;
			VERTEX[n].V = (2 * b) / 360;
			VERTEX[n].U = (a + space) / 360;
			n++;

			VERTEX[n].X = R * sin((a + space) / 180 * PI) * sin((b + space) / 180 * PI) – H;
			VERTEX[n].Y = R * cos((a + space) / 180 * PI) * sin((b + space) / 180 * PI) + K;
			VERTEX[n].Z = R * cos((b + space) / 180 * PI) – Z;
			VERTEX[n].V = (2 * (b + space)) / 360;
			VERTEX[n].U = (a + space) / 360;
			n++;

		}
	}
}

DisplaySphere(5, texture[0]);

void DisplaySphere (double R, GLuint texture){
	int b;

	glScalef (0.0125 * R, 0.0125 * R, 0.0125 * R);
	glRotatef (90, 1, 0, 0)
	glBindTexture (GL_TEXTURE_2D, texture);
	glBegin (GL_TRIANGLE_STRIP);

	for ( b = 0; b <= VertexCount; b++){
		glTexCoord2f (VERTEX[b].U, VERTEX[b].V);
		glVertex3f (VERTEX[b].X, VERTEX[b].Y, -VERTEX[b].Z);
	}

	for ( b = 0; b <= VertexCount; b++){
		glTexCoord2f (VERTEX[b].U, -VERTEX[b].V);
		glVertex3f (VERTEX[b].X, VERTEX[b].Y, VERTEX[b].Z);
	}

	glEnd();
}
