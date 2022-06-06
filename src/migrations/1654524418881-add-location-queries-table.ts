import { MigrationInterface, QueryRunner } from "typeorm";

export class addLocationQueriesTable1654524418881 implements MigrationInterface {
    name = 'addLocationQueriesTable1654524418881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`location_queries\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ip\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`location_queries\` ADD CONSTRAINT \`FK_9b68b853c5546cad05afbdd9672\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location_queries\` DROP FOREIGN KEY \`FK_9b68b853c5546cad05afbdd9672\``);
        await queryRunner.query(`DROP TABLE \`location_queries\``);
    }

}
