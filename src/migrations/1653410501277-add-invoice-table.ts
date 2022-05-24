import { MigrationInterface, QueryRunner } from "typeorm";

export class addInvoiceTable1653410501277 implements MigrationInterface {
    name = 'addInvoiceTable1653410501277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`invoices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`totalFee\` int NOT NULL, \`driverFee\` int NOT NULL, \`heroFee\` int NOT NULL, \`goochooriFee\` int NOT NULL, \`transferStartedAt\` datetime NOT NULL, \`transferFinishedAt\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`invoiceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD UNIQUE INDEX \`IDX_cfa3817af5e56ffc5adef90d4e\` (\`invoiceId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_cfa3817af5e56ffc5adef90d4e\` ON \`orders\` (\`invoiceId\`)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_cfa3817af5e56ffc5adef90d4e1\` FOREIGN KEY (\`invoiceId\`) REFERENCES \`invoices\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_cfa3817af5e56ffc5adef90d4e1\``);
        await queryRunner.query(`DROP INDEX \`REL_cfa3817af5e56ffc5adef90d4e\` ON \`orders\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP INDEX \`IDX_cfa3817af5e56ffc5adef90d4e\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`invoiceId\``);
        await queryRunner.query(`DROP TABLE \`invoices\``);
    }

}
